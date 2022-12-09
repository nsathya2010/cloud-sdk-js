import nock from 'nock';
import * as jwt123 from 'jsonwebtoken';
import {
  destinationServiceUri,
  providerXsuaaUrl,
  xsuaaBindingMock
} from '../../../../test-resources/test/test-util/environment-mocks';
import { privateKey } from '../../../../test-resources/test/test-util/keys';
import { getClientCredentialsToken } from './xsuaa-service';
import { circuitBreaker, fetchDestination } from './destination';

const jwt = jwt123.sign(
  JSON.stringify({ user_id: 'user', zid: 'tenant' }),
  privateKey,
  {
    algorithm: 'RS512'
  }
);

describe('circuit breaker', () => {
  afterEach(() => {
    circuitBreaker.enable();
    nock.cleanAll();
  });
  beforeEach(() => {
    circuitBreaker.enable();
    nock.cleanAll();
  });

  it('opens after 50% failed request attempts (with at least 10 recorded requests) for destination service', async () => {
    const request = () =>
      fetchDestination(destinationServiceUri, jwt, {
        destinationName: 'FINAL-DESTINATION'
      });

    nock(destinationServiceUri)
      .get(/.*/)
      .times(1)
      .reply(200, JSON.stringify({ URL: 'test' }));

    // First attempt should succeed
    await expect(request()).resolves.toBeDefined();

    // All following requests will fail to open the breaker
    nock(destinationServiceUri).persist().get(/.*/).reply(400);

    let keepCalling = true;
    let failedCalls = 0;
    // hit until breaker opens
    while (keepCalling) {
      try {
        await request();
        await sleep(50);
      } catch (e) {
        if (e.cause.message === 'Request failed with status code 400') {
          failedCalls++;
        }
        if (e.cause.message === 'Breaker is open') {
          keepCalling = false;
        }
      }
    }
    // Since we exit the loop breaker opened.
    expect(failedCalls).toBeGreaterThan(0);
  });

  it('opens after 50% failed request attempts (with at least 10 recorded requests) for xsuaa service', async () => {
    const request = () => getClientCredentialsToken(xsuaaBindingMock);

    nock(providerXsuaaUrl)
      .post('/oauth/token')
      .times(1)
      .reply(200, { access_token: 'token' });

    // First attempt should succeed
    await expect(request()).resolves.toBeDefined();

    // All following requests will fail to open the breaker
    const mock = nock(providerXsuaaUrl)
      .persist()
      .post('/oauth/token')
      .reply(400);

    let keepCalling = true;
    let failedCalls = 0;
    // hit until breaker opens
    while (keepCalling) {
      try {
        await request();
        await sleep(50);
      } catch (e) {
        if (
          e ===
          'Error in fetching the token for service my-xsuaa: Request failed with status code 400'
        ) {
          failedCalls++;
        }
        if (e.message === 'Breaker is open') {
          keepCalling = false;
        }
      }
    }
    // Since we exit the loop breaker opened.
    expect(failedCalls).toBeGreaterThan(0);
  }, 99999);
});

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
