import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { createPublicKey } from 'node:crypto';
import nock from 'nock';
import {
  destinationBindingClientSecretMock,
  jku,
  mockServiceBindings,
  publicKey,
  signedJwt,
  signedJwtForVerification,
  xsuaaBindingMock
} from '../../../../test-resources/test/test-util';
import {
  audiences,
  retrieveJwt,
  verifyJwt,
  isXsuaaToken,
  decodeOrMakeJwt,
  decodeJwt
} from './jwt';
import { clearXsuaaServices } from './environment-accessor';

const jwtPayload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: 1516239022,
  ext_attr: { enhancer: 'XSUAA' },
  aud: ['xsapp-myapp!123.clientid'],
  zid: 'my-zone',
  client_id: 'clientid'
};

export function responseWithPublicKey(key: string = publicKey) {
  const pubKey = createPublicKey(key);
  const jwk = pubKey.export({ format: 'jwk' });
  return {
    keys: [
      {
        use: 'sig',
        kid: 'key-id-1',
        alg: 'RS256',
        ...jwk
      }
    ]
  };
}

describe('jwt', () => {
  describe('isXsuaaToken()', () => {
    it('returns true if the token was issued by XSUAA', () => {
      const jwt = decodeJwt(
        signedJwtForVerification({ ext_attr: { enhancer: 'XSUAA' } })
      );
      expect(isXsuaaToken(jwt)).toBe(true);
    });

    it('returns false if the token was not issued XSUAA', () => {
      const jwt = decodeJwt(
        signedJwtForVerification({ ext_attr: { enhancer: 'IAS' } })
      );
      mockServiceBindings({ xsuaaBinding: false });
      expect(isXsuaaToken(jwt)).toBe(false);
    });

    it('returns false if no enhancer is set', () => {
      const jwt = decodeJwt(signedJwtForVerification({}));
      expect(isXsuaaToken(jwt)).toBe(false);
    });
  });

  describe('retrieveJwt()', () => {
    it('returns undefined when incoming message has no auth header', () => {
      expect(retrieveJwt(createIncomingMessageWithJWT())).toBeUndefined();
    });

    it('returns undefined when incoming message has non bearer auth token', () => {
      expect(retrieveJwt(createIncomingMessageWithJWT('test'))).toBeUndefined();
    });

    it('correctly reads jwt from incoming message with correct auth token', () => {
      expect(retrieveJwt(createIncomingMessageWithJWT('Bearer test'))).toBe(
        'test'
      );
    });

    it('works for arbitrary capitalizations of "bearer" (e.g. lowercase)', () => {
      expect(retrieveJwt(createIncomingMessageWithJWT('bearer test'))).toBe(
        'test'
      );
      expect(retrieveJwt(createIncomingMessageWithJWT('BeArEr test'))).toBe(
        'test'
      );
      expect(retrieveJwt(createIncomingMessageWithJWT('BEARER test'))).toBe(
        'test'
      );
    });
  });

  describe('verifyJwt())', () => {
    beforeEach(() => {
      process.env.VCAP_SERVICES = JSON.stringify({
        xsuaa: [
          {
            ...xsuaaBindingMock,
            credentials: {
              ...xsuaaBindingMock.credentials,
              verificationkey: undefined
            }
          }
        ]
      });
    });

    afterEach(() => {
      nock.cleanAll();
      delete process.env.VCAP_SERVICES;
      clearXsuaaServices();
    });

    it('succeeds and decodes for correct key', async () => {
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey());

      await expect(
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).resolves.toEqual(jwtPayload);
    });

    it('succeeds and decodes for correct inline key', async () => {
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey(publicKey));

      await expect(
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).resolves.toEqual(jwtPayload);
    });

    it('fails for no key', async () => {
      nock(jku).get('').query({ zid: jwtPayload.zid }).reply(200, { keys: [] });

      await expect(
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).rejects.toMatchObject({
        message: 'Failed to verify JWT.',
        cause: {
          message: 'JWKS does not contain a key for kid=key-id-1'
        }
      });
    });

    it('fails for incorrect key id', async () => {
      const response = responseWithPublicKey();
      response.keys[0].kid = 'otherKey';
      nock(jku).get('').query({ zid: jwtPayload.zid }).reply(200, response);

      await expect(() =>
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).rejects.toMatchObject({
        message: 'Failed to verify JWT.',
        cause: {
          message: 'JWKS does not contain a key for kid=key-id-1'
        }
      });
    });

    xit('fails if the verification key does not conform with the signed JWT', async () => {
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey('WRONG'));

      await expect(() =>
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Failed to verify JWT."');
    });

    it('caches the key after fetching it', async () => {
      // We mock only a single HTTP call
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey());

      await verifyJwt(signedJwtForVerification(jwtPayload), {
        cacheVerificationKeys: true
      });
      // If you execute all tests the cache of xssec is populated already and the nock remains. Hence this extra clean.
      nock.cleanAll();

      // But due to caching multiple calls should not lead to errors
      await expect(
        verifyJwt(signedJwtForVerification(jwtPayload), {
          cacheVerificationKeys: true
        })
      ).resolves.toEqual(jwtPayload);
    });

    it('fails on the second call when caching is disabled', async () => {
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey());

      await verifyJwt(signedJwtForVerification(jwtPayload), {
        cacheVerificationKeys: false
      });

      nock(jku).get('/').query({ zid: jwtPayload.zid }).reply(500);

      await expect(() =>
        verifyJwt(signedJwtForVerification(jwtPayload))
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Failed to verify JWT."');
    });

    it('caches by default', async () => {
      nock(jku)
        .get('')
        .query({ zid: jwtPayload.zid })
        .reply(200, responseWithPublicKey());

      const jwt = signedJwtForVerification(jwtPayload);
      await verifyJwt(jwt);
      nock.cleanAll();
      // Second call does not fail due to caching.
      await verifyJwt(jwt);
    });
  });

  describe('audiences()', () => {
    it('returns a set of the entries of the "aud" claim, if present. If a dot is present, we only take everything before the dot', () => {
      const token = {
        aud: ['one', 'two.one', 'three.two.one']
      };

      expect(audiences(token)).toEqual(['one', 'two', 'three']);
    });

    it('returns an empty set if the "aud" claim is empty', () => {
      const tokenEmpty = { aud: [] };

      expect(audiences(tokenEmpty)).toEqual([]);
    });

    it('returns audiences from scope, if no "aud" property exists', () => {
      const token = {
        scope: ['one', 'two.one', 'three.two.one']
      };

      expect(audiences(token)).toEqual(['two', 'three']);
    });

    it('returns an empty set if the "aud" claim is missing and the "scope" claim is empty', () => {
      const tokenEmpty = { scope: [] };

      expect(audiences(tokenEmpty)).toEqual([]);
    });

    it('returns an empty set if neither the "aud" nor the "scope" claim are present', () => {
      expect(audiences({})).toEqual([]);
    });
  });

  describe('decodeOrMakeJwt', () => {
    afterEach(() => {
      delete process.env.VCAP_SERVICES;
    });

    it('returns decoded JWT, if JWT has `zid` (XSUAA)', () => {
      const payload = { zid: 'test', iat: 123 };
      expect(decodeOrMakeJwt(signedJwt(payload))).toEqual(payload);
    });

    it('returns decoded JWT, if JWT has `app_tid` (IAS)', () => {
      const payload = { app_tid: 'test', iat: 123 };
      expect(decodeOrMakeJwt(signedJwt(payload))).toEqual(payload);
    });

    it('returns undefined, if JWT has no `zid` nor `app_tid`', () => {
      expect(decodeOrMakeJwt(signedJwt({ user_id: 'test' }))).toBeUndefined();
    });

    it('does not throw, if there is no XSUAA binding present', () => {
      expect(() => decodeOrMakeJwt(undefined)).not.toThrow();
    });

    it("returns the XSUAA service binding's tenant ID as `zid`, if JWT is not present and binding is present", () => {
      mockServiceBindings({ xsuaaBinding: true });
      expect(decodeOrMakeJwt(undefined)).toEqual({
        zid: xsuaaBindingMock.credentials.tenantid
      });
    });

    it("returns the destination service binding's tenant ID, if JWT, XSUAA and identity service bindings are missing", () => {
      mockServiceBindings({ xsuaaBinding: false });
      expect(decodeOrMakeJwt(undefined)).toEqual({
        zid: destinationBindingClientSecretMock.credentials.tenantid
      });
    });
  });
});

function createIncomingMessageWithJWT(token?: string): IncomingMessage {
  const msg = new IncomingMessage(new Socket());
  if (token) {
    msg.headers.authorization = token;
  }

  return msg;
}
