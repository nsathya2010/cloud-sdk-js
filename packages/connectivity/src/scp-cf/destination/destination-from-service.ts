import { createLogger } from '@sap-cloud-sdk/util';
import { addProxyConfigurationOnPrem } from '../connectivity-service';
import {
  getDestinationService,
  getDestinationServiceCredentialsList
} from '../environment-accessor';
import { DestinationServiceCredentials } from '../environment-accessor-types';
import { exchangeToken, isTokenExchangeEnabled } from '../identity-service';
import { JwtPair } from '../jwt';
import { isIdenticalTenant } from '../tenant';
import { jwtBearerToken, serviceToken } from '../token-accessor';
import { getSubdomainAndZoneId } from '../xsuaa-service';
import {
  DestinationFetchOptions,
  DestinationsByType
} from './destination-accessor-types';
import {
  destinationCache,
  getDefaultIsolationStrategy
} from './destination-cache';
import {
  alwaysProvider,
  alwaysSubscriber,
  subscriberFirst
} from './destination-selection-strategies';
import {
  AuthAndExchangeTokens,
  fetchCertificate,
  fetchDestination,
  fetchInstanceDestinations,
  fetchSubaccountDestinations
} from './destination-service';
import {
  assertHttpDestination,
  Destination
} from './destination-service-types';
import { getProviderServiceToken } from './get-provider-token';
import {
  getRequiredSubscriberToken,
  getSubscriberToken,
  hasTokens,
  SubscriberToken
} from './get-subscriber-token';
import {
  addProxyConfigurationInternet,
  proxyStrategy
} from './http-proxy-util';

type DestinationOrigin = 'subscriber' | 'provider';

type RequiredProperties<T, P extends keyof T> = Required<Pick<T, P>> &
  Omit<T, P>;

const logger = createLogger({
  package: 'connectivity',
  messageContext: 'destination-accessor-service'
});

interface DestinationSearchResult {
  destination: Destination;
  fromCache: boolean;
  origin: DestinationOrigin;
}

const emptyDestinationByType: DestinationsByType = {
  instance: [],
  subaccount: []
};

/**
 * Utility function to get destination service credentials, including error handling.
 * @internal
 */
export function getDestinationServiceCredentials(): DestinationServiceCredentials {
  const credentials = getDestinationServiceCredentialsList();
  if (!credentials?.length) {
    throw Error(
      'No binding to a destination service instance found. Please bind a destination service instance to your application.'
    );
  }
  if (credentials.length > 1) {
    logger.warn(
      'Found more than one destination service instance. Using the first one.'
    );
  }

  return credentials[0];
}

/**
 * Retrieves a destination with the given name from the Cloud Foundry destination service.
 * Returns `null`, if no destination can be found.
 * Requires the following service bindings: destination, XSUAA
 * By default, selects subscriber over provider and instance over subaccount destinations.
 * @param options - Configuration for how to retrieve destinations from the destination service.
 * @returns A promise returning the requested destination on success.
 */
export async function getDestinationFromDestinationService(
  options: DestinationFetchOptions
): Promise<Destination | null> {
  logger.debug('Attempting to retrieve destination from destination service.');
  return DestinationFromServiceRetriever.getDestinationFromDestinationService(
    options
  );
}

/**
 * @internal
 */
export class DestinationFromServiceRetriever {
  public static async getDestinationFromDestinationService(
    options: DestinationFetchOptions
  ): Promise<Destination | null> {
    if (isTokenExchangeEnabled(options)) {
      options.jwt = await exchangeToken(options);
    }

    const subscriberToken = await getSubscriberToken(options);
    const providerToken = await getProviderServiceToken(options);

    const da = new DestinationFromServiceRetriever(
      options,
      subscriberToken,
      providerToken
    );

    const destinationResult =
      await da.searchDestinationWithSelectionStrategyAndCache();
    if (!destinationResult) {
      return null;
    }

    if (destinationResult.fromCache) {
      return destinationResult.destination;
    }

    let { destination } = destinationResult;

    if (
      destination.authentication === 'OAuth2UserTokenExchange' ||
      destination.authentication === 'OAuth2JWTBearer' ||
      destination.authentication === 'SAMLAssertion' ||
      (destination.authentication === 'OAuth2SAMLBearerAssertion' &&
        !da.usesSystemUser(destination))
    ) {
      destination = await da.fetchDestinationWithUserExchangeFlows(
        destinationResult
      );
    }

    if (destination.authentication === 'PrincipalPropagation') {
      if (!this.isUserJwt(da.subscriberToken)) {
        DestinationFromServiceRetriever.throwUserTokenMissing(destination);
      }
    }

    if (
      destination.authentication === 'OAuth2Password' ||
      destination.authentication === 'ClientCertificateAuthentication' ||
      destination.authentication === 'OAuth2ClientCredentials' ||
      da.usesSystemUser(destination)
    ) {
      destination = await da.fetchDestinationWithNonUserExchangeFlows(
        destinationResult
      );
    }

    if (destination.authentication === 'OAuth2RefreshToken') {
      destination = await da.fetchDestinationWithRefreshTokenFlow(
        destinationResult
      );
    }

    const withProxySetting = await da.addProxyConfiguration(destination);
    const withTrustStore = await da.addTrustStoreConfiguration(
      withProxySetting,
      destinationResult.origin
    );
    await da.updateDestinationCache(withTrustStore, destinationResult.origin);
    return withTrustStore;
  }

  private static throwUserTokenMissing(destination) {
    throw Error(
      `No user token (JWT) has been provided. This is strictly necessary for '${destination.authentication}'.`
    );
  }

  private static checkDestinationForCustomJwt(destination: Destination): void {
    if (!destination.jwks && !destination.jwksUri) {
      throw new Error(
        'Failed to verify the JWT with no JKU! Destination must have `x_user_token.jwks` or `x_user_token.jwks_uri` property.'
      );
    }
  }

  private static isUserJwt(
    token: SubscriberToken | undefined
  ): token is SubscriberToken & { userJwt: JwtPair } {
    return !!token?.userJwt;
  }

  private options: RequiredProperties<
    Omit<DestinationFetchOptions, 'userJwt' | 'iss'>,
    'isolationStrategy' | 'selectionStrategy' | 'useCache'
  >;

  private constructor(
    options: DestinationFetchOptions,
    readonly subscriberToken: SubscriberToken | undefined,
    readonly providerServiceToken: JwtPair
  ) {
    const defaultOptions = {
      isolationStrategy: getDefaultIsolationStrategy(
        subscriberToken?.userJwt?.decoded
      ),
      selectionStrategy: subscriberFirst,
      useCache: !!options.isolationStrategy
    };
    this.options = { ...defaultOptions, ...options };
  }

  private async searchDestinationWithSelectionStrategyAndCache(): Promise<
    DestinationSearchResult | undefined
  > {
    let destinationSearchResult: DestinationSearchResult | undefined;
    if (this.isSubscriberNeeded()) {
      destinationSearchResult =
        await this.searchSubscriberAccountForDestination();
    }

    if (this.isProviderNeeded(destinationSearchResult)) {
      destinationSearchResult =
        await this.searchProviderAccountForDestination();
    }
    if (destinationSearchResult && !destinationSearchResult.fromCache) {
      logger.debug(
        'Successfully retrieved destination from destination service.'
      );
    }
    if (destinationSearchResult && destinationSearchResult.fromCache) {
      logger.debug(
        `Successfully retrieved destination from destination service cache for ${destinationSearchResult.origin} destinations.`
      );
    }
    if (!destinationSearchResult) {
      logger.debug('Could not retrieve destination from destination service.');
    }

    return destinationSearchResult;
  }

  private async getInstanceAndSubaccountDestinations(
    accessToken: string
  ): Promise<DestinationsByType> {
    const [instance, subaccount] = await Promise.all([
      fetchInstanceDestinations(
        getDestinationServiceCredentials().uri,
        accessToken,
        this.options
      ),
      fetchSubaccountDestinations(
        getDestinationServiceCredentials().uri,
        accessToken,
        this.options
      )
    ]);

    return {
      instance,
      subaccount
    };
  }

  private async fetchDestinationByToken(
    jwt: string | AuthAndExchangeTokens
  ): Promise<Destination> {
    return fetchDestination(
      getDestinationServiceCredentials().uri,
      jwt,
      this.options
    );
  }

  private getExchangeTenant(destination: Destination): string | undefined {
    if (destination.authentication !== 'OAuth2ClientCredentials') {
      return undefined;
    }
    if (destination.originalProperties!['tokenServiceURLType'] !== 'Common') {
      return undefined;
    }
    const subdomainSubscriber = getSubdomainAndZoneId(
      this.subscriberToken?.userJwt?.encoded
    ).subdomain;
    const subdomainProvider = getSubdomainAndZoneId(
      this.providerServiceToken?.encoded
    ).subdomain;
    return subdomainSubscriber || subdomainProvider || undefined;
  }

  private async getAuthTokenForOAuth2ClientCredentials(
    destinationResult: DestinationSearchResult
  ): Promise<AuthAndExchangeTokens> {
    const { destination, origin } = destinationResult;
    // This covers the X-Tenant case https://api.sap.com/api/SAP_CP_CF_Connectivity_Destination/resource
    const exchangeTenant = this.getExchangeTenant(destination);
    const clientGrant = await serviceToken('destination', {
      jwt:
        origin === 'provider'
          ? this.providerServiceToken.decoded
          : this.subscriberToken!.serviceJwt!.decoded
    });
    return { authHeaderJwt: clientGrant, exchangeTenant };
  }

  // This covers the two technical user propagation https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681/Cloud/en-US/3cb7b81115c44cf594e0e3631291af94.html
  private usesSystemUser(destination: Destination): boolean {
    // put this in the non user dependent block
    if (
      destination.systemUser &&
      destination.authentication === 'OAuth2SAMLBearerAssertion'
    ) {
      logger.debug(
        `System user found on destination: "${destination.name}". 
The property SystemUser has been deprecated. 
It is highly recommended that you stop using it.
Possible alternatives for such technical user authentication are BasicAuthentication, OAuth2ClientCredentials, or ClientCertificateAuthentication`
      );
      return true;
    }

    return false;
  }

  private async getAuthTokenForOAuth2UserBasedTokenExchanges(
    destinationResult: DestinationSearchResult
  ): Promise<AuthAndExchangeTokens> {
    const { destination, origin } = destinationResult;
    const { destinationName } = this.options;
    if (!DestinationFromServiceRetriever.isUserJwt(this.subscriberToken)) {
      throw DestinationFromServiceRetriever.throwUserTokenMissing(destination);
    }
    // This covers OAuth to user-dependent auth flows https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681/Cloud/en-US/39d42654093e4f8db20398a06f7eab2b.html and https://api.sap.com/api/SAP_CP_CF_Connectivity_Destination/resource
    // Which is the same for: OAuth2UserTokenExchange, OAuth2JWTBearer and OAuth2SAMLBearerAssertion

    // If subscriber token does not include service JWT (aka. originally passed JWT was not an XSUAA JWT) enforce the JWKS properties are there - destination service would do that as well. https://help.sap.com/docs/CP_CONNECTIVITY/cca91383641e40ffbe03bdc78f00f681/d81e1683bd434823abf3ceefc4ff157f.html
    if (!this.subscriberToken.serviceJwt) {
      DestinationFromServiceRetriever.checkDestinationForCustomJwt(destination);
    }

    // Case 1 Destination in provider and JWT issued for provider account, but no custom JWT given -> no extra x-user-token header needed
    if (
      this.subscriberToken.serviceJwt &&
      isIdenticalTenant(
        this.subscriberToken.userJwt.decoded,
        this.providerServiceToken.decoded
      )
    ) {
      logger.debug(
        `UserExchange flow started without user exchange token for destination ${destinationName} of the provider account.`
      );
      return {
        authHeaderJwt: await jwtBearerToken(
          this.subscriberToken.userJwt.encoded,
          getDestinationService()
        )
      };
    }
    // Case 2 Subscriber and provider account not the same OR custom JWT -> x-user-token header passed to determine user and tenant in token service URL and service token to get the destination
    const serviceJwt =
      origin === 'provider'
        ? this.providerServiceToken
        : // TODO: What is the meaning of this? Why do we assume this is defined. Technically, it might not be.
          this.subscriberToken.serviceJwt!;
    logger.debug(
      `UserExchange flow started for destination ${destinationName} of the ${origin} account.`
    );

    return {
      authHeaderJwt: serviceJwt.encoded, // token to get destination from service
      exchangeHeaderJwt: this.subscriberToken.userJwt.encoded // token considered for user and tenant
    };
  }

  private async getAuthTokenForOAuth2RefreshToken(
    destinationResult: DestinationSearchResult
  ): Promise<AuthAndExchangeTokens> {
    const { destination, origin } = destinationResult;
    const { refreshToken } = this.options;
    if (!refreshToken) {
      throw Error(
        `No refresh token has been provided. This is strictly necessary for '${destination.authentication}'.`
      );
    }
    const clientGrant =
      origin === 'provider'
        ? this.providerServiceToken.encoded
        : this.subscriberToken!.serviceJwt!.encoded;
    return { authHeaderJwt: clientGrant, refreshToken };
  }

  /**
   * @internal
   * This method calls the 'find destination by name' endpoint of the destination service using a client credentials grant.
   * For the find by name endpoint, the destination service will take care of OAuth flows and include the token in the destination.
   * @param destinationResult - Result of the getDestinations call for which the exchange flow is triggered.
   * @returns Destination containing the auth token.
   */
  private async fetchDestinationWithNonUserExchangeFlows(
    destinationResult: DestinationSearchResult
  ): Promise<Destination> {
    const token = await this.getAuthTokenForOAuth2ClientCredentials(
      destinationResult
    );

    return this.fetchDestinationByToken(token);
  }

  private async fetchDestinationWithUserExchangeFlows(
    destinationResult: DestinationSearchResult
  ): Promise<Destination> {
    const token = await this.getAuthTokenForOAuth2UserBasedTokenExchanges(
      destinationResult
    );
    return this.fetchDestinationByToken(token);
  }

  private async fetchDestinationWithRefreshTokenFlow(
    destinationResult: DestinationSearchResult
  ): Promise<Destination> {
    const token = await this.getAuthTokenForOAuth2RefreshToken(
      destinationResult
    );
    return this.fetchDestinationByToken(token);
  }

  private async addProxyConfiguration(
    destination: Destination
  ): Promise<Destination> {
    switch (proxyStrategy(destination)) {
      case 'on-premise':
        return addProxyConfigurationOnPrem(
          destination,
          hasTokens(this.subscriberToken)
            ? getRequiredSubscriberToken(this.subscriberToken)
            : undefined
        );
      case 'internet':
      case 'private-link':
        assertHttpDestination(destination);
        return addProxyConfigurationInternet(destination);
      case 'no-proxy':
        return destination;
      default:
        throw new Error(
          'Illegal argument: No valid proxy configuration found in the destination input to be added.'
        );
    }
  }

  private async updateDestinationCache(
    destination: Destination,
    destinationOrigin: DestinationOrigin
  ) {
    if (!this.options.useCache) {
      return destination;
    }
    await destinationCache.cacheRetrievedDestination(
      destinationOrigin === 'subscriber'
        ? getRequiredSubscriberToken(this.subscriberToken)
        : this.providerServiceToken.decoded,
      destination,
      this.options.isolationStrategy
    );
  }

  private async getProviderDestinationService(): Promise<
    DestinationSearchResult | undefined
  > {
    const provider = await this.getInstanceAndSubaccountDestinations(
      this.providerServiceToken.encoded
    );
    const destination = this.options.selectionStrategy(
      {
        subscriber: emptyDestinationByType,
        provider
      },
      this.options.destinationName
    );
    if (destination) {
      return {
        destination,
        fromCache: false,
        origin: 'provider'
      };
    }
  }

  private async getProviderDestinationCache(): Promise<
    DestinationSearchResult | undefined
  > {
    const destination = await destinationCache.retrieveDestinationFromCache(
      this.providerServiceToken.decoded,
      this.options.destinationName,
      this.options.isolationStrategy
    );

    if (destination) {
      return { destination, fromCache: true, origin: 'subscriber' };
    }
  }

  private async getSubscriberDestinationService(): Promise<
    DestinationSearchResult | undefined
  > {
    if (!this.subscriberToken?.serviceJwt) {
      throw new Error(
        'Try to get destinations from subscriber account but service JWT was not set.'
      );
    }

    const subscriber = await this.getInstanceAndSubaccountDestinations(
      this.subscriberToken.serviceJwt.encoded
    );
    const destination = this.options.selectionStrategy(
      {
        subscriber,
        provider: emptyDestinationByType
      },
      this.options.destinationName
    );

    if (destination) {
      return { destination, fromCache: false, origin: 'subscriber' };
    }
  }

  private async getSubscriberDestinationCache(): Promise<
    DestinationSearchResult | undefined
  > {
    const destination = await destinationCache.retrieveDestinationFromCache(
      getRequiredSubscriberToken(this.subscriberToken),
      this.options.destinationName,
      this.options.isolationStrategy
    );

    if (destination) {
      return { destination, fromCache: true, origin: 'subscriber' };
    }
  }

  private isProviderNeeded(
    resultFromSubscriber: DestinationSearchResult | undefined
  ): boolean {
    if (this.options.selectionStrategy === alwaysSubscriber) {
      return false;
    }

    if (
      this.options.selectionStrategy === subscriberFirst &&
      resultFromSubscriber
    ) {
      return false;
    }

    return true;
  }

  private isSubscriberNeeded(): boolean {
    if (!this.subscriberToken) {
      return false;
    }

    if (!this.subscriberToken.serviceJwt) {
      return false;
    }

    if (this.options.selectionStrategy === alwaysProvider) {
      return false;
    }

    return true;
  }

  private async searchProviderAccountForDestination(): Promise<
    DestinationSearchResult | undefined
  > {
    return (
      (this.options.useCache && (await this.getProviderDestinationCache())) ||
      this.getProviderDestinationService()
    );
  }

  private async searchSubscriberAccountForDestination(): Promise<
    DestinationSearchResult | undefined
  > {
    return (
      (this.options.useCache && (await this.getSubscriberDestinationCache())) ||
      this.getSubscriberDestinationService()
    );
  }

  private async addTrustStoreConfiguration(
    destination: Destination,
    origin: DestinationOrigin
  ): Promise<Destination> {
    if (destination.originalProperties?.TrustStoreLocation) {
      const trustStoreCertificate = await fetchCertificate(
        getDestinationServiceCredentials().uri,
        origin === 'provider'
          ? this.providerServiceToken.encoded
          : this.subscriberToken!.serviceJwt!.encoded,
        destination.originalProperties.TrustStoreLocation
      );
      destination.trustStoreCertificate = trustStoreCertificate;
    }
    return destination;
  }
}
