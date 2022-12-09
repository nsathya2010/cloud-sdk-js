import * as xssec from '@sap/xssec';
import CircuitBreaker from 'opossum';
import { wrapInTimeout } from '@sap-cloud-sdk/resilience/internal';
import { JwtPayload } from './jsonwebtoken-type';
import { parseSubdomain } from './subdomain-replacer';
import { decodeJwt } from './jwt';
import { Service } from './environment-accessor-types';
import { circuitBreakerDefaultOptions } from './resilience-options';
import { ClientCredentialsResponse } from './xsuaa-service-types';
import { resolveService } from './environment-accessor';

let circuitBreaker: any;

function executeFunction<T extends (...args: any[]) => any>(
  fn: T,
  ...parameters: Parameters<T>
): ReturnType<T> {
  return fn(...parameters);
}

function getCircuitBreaker() {
  if (!circuitBreaker) {
    circuitBreaker = new CircuitBreaker(
      executeFunction,
      circuitBreakerDefaultOptions
    );
  }
  return circuitBreaker;
}

/**
 * Wrap a function in a circuit breaker. Important if you trigger this recursively you have to adjust the parameters to avoid an infinite stack.
 * @param fn - Function to wrap.
 * @returns A function to be called with the original parameters.
 */
function wrapInCircuitBreaker<T extends (...args: any[]) => any>(
  fn: T
): (...parameters: Parameters<T>) => ReturnType<T> {
  return (...parameters: Parameters<T>) =>
    getCircuitBreaker().fire(fn, ...parameters);
}

// `@sap/xssec` sometimes checks `null` without considering `undefined`.
interface SubdomainAndZoneId {
  subdomain: string | null;
  zoneId: string | null;
}

/**
 * Get subdomain and zoneId value from a given JWT.
 * @param jwt - A JWT from the current user.
 * @returns subdomain and zoneId from the JWT
 * @internal
 */
export function getSubdomainAndZoneId(
  jwt?: string | JwtPayload
): SubdomainAndZoneId {
  let subdomain: string | null = null;
  let zoneId: string | null = null;

  if (jwt) {
    const jwtPayload = typeof jwt === 'string' ? decodeJwt(jwt) : jwt;

    if (jwtPayload.iss) {
      subdomain = parseSubdomain(jwtPayload.iss);
    }
    if (jwtPayload.zid) {
      zoneId = jwtPayload.zid;
    }
  }

  return { subdomain, zoneId };
}

/**
 * Make a user token request against the XSUAA service.
 * @param service - Service as it is defined in the environment variable.
 * @param userJwt - User JWT.
 * @returns Client credentials token.
 */
export async function getClientCredentialsToken(
  service: string | Service,
  userJwt?: string | JwtPayload
): Promise<ClientCredentialsResponse> {
  const serviceCredentials = resolveService(service).credentials;
  const subdomainAndZoneId = getSubdomainAndZoneId(userJwt);

  const xssecPromise: () => Promise<ClientCredentialsResponse> = () =>
    new Promise((resolve, reject) => {
      xssec.requests.requestClientCredentialsToken(
        subdomainAndZoneId.subdomain,
        serviceCredentials,
        null,
        subdomainAndZoneId.zoneId,
        (
          err: Error,
          token: string,
          tokenResponse: ClientCredentialsResponse
        ) => {
          const isServiceInterface = (
            serviceInterface: Service | string
          ): serviceInterface is Service =>
            !!(serviceInterface as Service).name;
          const serviceName = isServiceInterface(service)
            ? service.name
            : service;

          return err
            ? reject(
                `Error in fetching the token for service ${serviceName}: ${err.message}`
              )
            : resolve(tokenResponse);
        }
      );
    });

  // TODO: Use middleware https://github.com/SAP/cloud-sdk-backlog/issues/667
  return wrapInCircuitBreaker((ser, jwt) =>
    wrapInTimeout(xssecPromise(), 10000, 'Token retrieval ran into timeout.')
  )(service, userJwt);
}

/**
 * Make a user token request against the XSUAA service.
 * @param service - Service as it is defined in the environment variable.
 * @param userJwt - User JWT.
 * @returns User token.
 */
export function getUserToken(
  service: Service,
  userJwt: string
): Promise<string> {
  const subdomainAndZoneId = getSubdomainAndZoneId(userJwt);

  const xssecPromise = new Promise((resolve: (token: string) => void, reject) =>
    xssec.requests.requestUserToken(
      userJwt,
      service.credentials,
      null,
      null,
      subdomainAndZoneId.subdomain,
      subdomainAndZoneId.zoneId,
      (err: Error, token: string) => (err ? reject(err) : resolve(token))
    )
  );
  // TODO: Use middleware https://github.com/SAP/cloud-sdk-backlog/issues/667
  return wrapInCircuitBreaker((ser, jwt) =>
    wrapInTimeout(xssecPromise, 10000, 'Token retrieval ran into timeout.')
  )(service, userJwt);
}
