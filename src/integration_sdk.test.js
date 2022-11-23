/* eslint camelcase: "off" */
import _ from 'lodash';
import { UUID, LatLng } from './types';
import { createAdapter, defaultHandler } from './fake/adapter';
import SharetribeSdk from './integration_sdk';
import memoryStore from './memory_store';
import { createRateLimiter } from './utils';

const CLIENT_ID = '08ec69f6-d37e-414d-83eb-324e94afddf0';
const CLIENT_SECRET = 'client-secret-value';

const errorListingId = 'eeeeeeee-eeee-eeee-eeee-000000000500';

/**
   Helper to improve error messages.

   Includes the `response` in the error message if
   `response` exists.
 */
const report = responsePromise =>
  responsePromise.catch(error => {
    if (error.response) {
      // eslint-disable-next-line no-param-reassign
      error.message = `${error.message}. Response: ${JSON.stringify(error.response)}`;
    }

    throw error;
  });

/**
   Helper to create SDK instance for tests with default configurations.

   Pass additional configurations in `config` param to override defaults.

   Returns a map that contains all the instances that might be useful for
   tests, i.e. sdk, sdkTokenStore and adapter.
 */
const createSdk = (config = {}) => {
  const defaults = {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    queryLimiter: createRateLimiter({
      bucketInitial: 1,
      bucketIncreaseInterval: 250,
      bucketIncreaseAmount: 1,
      bucketMaximum: 5,
    }),
  };

  const sdkTokenStore = memoryStore();
  const adapter = createAdapter();

  const sdk = new SharetribeSdk({
    ...defaults,
    tokenStore: sdkTokenStore,
    ...config,
    adapter: adapter.adapterFn,
  });

  return {
    sdkTokenStore,
    adapter,
    sdk,
    adapterTokenStore: adapter.tokenStore,
  };
};

describe('new SharetribeSdk', () => {
  it('validates presence of clientId', () => {
    expect(() => new SharetribeSdk()).toThrowError('clientId must be provided');
  });

  it('validates presence of baseUrl', () => {
    expect(
      () =>
        new SharetribeSdk({
          clientId: CLIENT_ID,
          baseUrl: null,
        })
    ).toThrowError('baseUrl must be provided');
  });

  it('uses default baseUrl, if none is set', () => {
    const adapter = createAdapter((config, resolve) => {
      // Fake adapter that echoes the URL
      resolve({ data: { baseURL: config.baseURL } });
    });

    const authToken = adapter.tokenStore.createClientCredentialsToken(CLIENT_ID, CLIENT_SECRET);

    const sdkTokenStore = memoryStore();
    sdkTokenStore.setToken(authToken);

    const sdk = new SharetribeSdk({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      tokenStore: sdkTokenStore,
      adapter: adapter.adapterFn,
    });

    return sdk.revoke().then(res => {
      expect(res.data.baseURL).toMatch(/^https:\/\/flex-integ-api.sharetribe.com/);
    });
  });

  it('strips internals from the returned response object', () => {
    const { sdk } = createSdk();

    return report(
      sdk.users.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
        // Allow the following keys. Strip of some 'internals', i.e. config, headers, etc.
        const expectedKeys = ['status', 'statusText', 'data'];
        expect(expectedKeys).toEqual(expect.arrayContaining(Object.keys(res)));
      })
    );
  });

  it('strips internals from the returned error response object', () => {
    const { sdk } = createSdk();

    return report(
      sdk.listings
        .show({ id: errorListingId })
        .then(() => {
          // Fail
          expect(true).toEqual(false);
        })
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
          expect(e).toEqual(
            expect.objectContaining({
              status: 500,
              statusText: 'Internal server error',
              data: 'Internal server error',
            })
          );

          const expectedKeys = ['status', 'statusText', 'data'];
          expect(expectedKeys).toEqual(expect.arrayContaining(Object.keys(e)));

          return Promise.resolve();
        })
    );
  });

  it('calls users endpoint with query params', () => {
    const { sdk } = createSdk();

    return report(
      sdk.users.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
        const resource = res.data.data;
        const attrs = resource.attributes;

        expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
        expect(attrs).toEqual(
          expect.objectContaining({
            email: 'user@sharetribe.com',
            description: 'A team member',
          })
        );
      })
    );
  });

  it('calls marketplace endpoint with query params', () => {
    const { sdk } = createSdk();

    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(
        expect.objectContaining({
          name: 'Awesome skies.',
          description: 'Meet and greet with fanatical sky divers.',
        })
      );
    });
  });

  it('calls listing query with query params', () => {
    const { sdk } = createSdk();

    return sdk.listings.query().then(res => {
      const { data } = res.data;

      expect(data).toHaveLength(2);
      expect(data[0].attributes.description).toEqual('27-speed Hybrid. Fully functional.');
      expect(data[0].attributes.geolocation instanceof LatLng).toEqual(true);
      expect(data[0].attributes.geolocation).toEqual(new LatLng(40.64542, -74.08508));
      expect(data[1].attributes.description).toEqual(
        'Goes together perfectly with a latte and a bow tie.'
      );
      expect(data[1].attributes.geolocation instanceof LatLng).toEqual(true);
      expect(data[1].attributes.geolocation).toEqual(new LatLng(40.64542, -74.08508));
    });
  });

  it('allows user to pass custom read handlers', () => {
    class MyUuid {
      constructor(uuid) {
        this.myUuid = uuid;
      }
    }

    const handlers = [
      {
        sdkType: UUID,
        appType: MyUuid,
        reader: v => new MyUuid(v.uuid), // reader fn type: UUID -> MyUuid
      },
    ];

    const { sdk } = createSdk({
      typeHandlers: handlers,
    });

    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new MyUuid('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(
        expect.objectContaining({
          name: 'Awesome skies.',
          description: 'Meet and greet with fanatical sky divers.',
        })
      );
    });
  });

  it('[DEPRECATED, uses keys that are renamed] allows user to pass custom read handlers', () => {
    class MyUuid {
      constructor(uuid) {
        this.myUuid = uuid;
      }
    }

    const handlers = [
      {
        type: UUID,
        customType: MyUuid,
        reader: v => new MyUuid(v.uuid), // reader fn type: UUID -> MyUuid
      },
    ];

    const { sdk } = createSdk({
      typeHandlers: handlers,
    });

    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new MyUuid('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(
        expect.objectContaining({
          name: 'Awesome skies.',
          description: 'Meet and greet with fanatical sky divers.',
        })
      );
    });
  });

  it('reads auth token from store and includes it in request headers', () => {
    const adapter = createAdapter((config, resolve, reject, tokenStore) => {
      // Fail auth requests, API call will succeed due to stored auth token
      if (config.url.startsWith('fake-adapter://fake-api/v1/auth')) {
        return reject({
          status: 401,
          data: '{}',
        });
      }
      return defaultHandler(config, resolve, reject, tokenStore);
    });

    const clientId = '08ec69f6-d37e-414d-83eb-324e94afddf0';
    const clientSecret = 'client-secret-value';
    const authToken = adapter.tokenStore.createClientCredentialsToken(clientId, clientSecret);

    const sdkTokenStore = memoryStore();
    sdkTokenStore.setToken(authToken);

    const sdk = new SharetribeSdk({
      baseUrl: 'fake-adapter://fake-api/',

      // The Fake server doesn't know this clientId/clientSecret. However, the
      // request passes because the access_token is in the store
      clientId: 'daaf8871-4723-45b8-bc97-9e335f46966d',
      clientSecret: 'some-client-secret',

      tokenStore: sdkTokenStore,
      adapter: adapter.adapterFn,
    });

    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(
        expect.objectContaining({
          name: 'Awesome skies.',
          description: 'Meet and greet with fanatical sky divers.',
        })
      );
    });
  });

  it('stores the auth token to the store', () => {
    const { sdk, sdkTokenStore } = createSdk();

    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
      const resource = res.data.data;
      const attrs = resource.attributes;
      const token = sdkTokenStore.getToken();

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(
        expect.objectContaining({
          name: 'Awesome skies.',
          description: 'Meet and greet with fanatical sky divers.',
        })
      );

      expect(token.access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);
      expect(token.token_type).toEqual('bearer');
      expect(token.expires_in).toEqual(86400);
    });
  });

  it('stores auth token after an API request', () => {
    const { sdk, sdkTokenStore } = createSdk();

    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        expect(sdkTokenStore.getToken().access_token).toEqual(
          `${CLIENT_ID}-${CLIENT_SECRET}-access-1`
        );
      })
    );
  });

  it('refreshes access token', () => {
    const { sdk, sdkTokenStore, adapterTokenStore } = createSdk();

    // First, call API to gain access token
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const { access_token } = sdkTokenStore.getToken();
        expect(access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);

        adapterTokenStore.expireAccessToken(access_token);

        return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
          expect(sdkTokenStore.getToken().access_token).toEqual(
            `${CLIENT_ID}-${CLIENT_SECRET}-access-2`
          );

          const resource = res.data.data;
          const attrs = resource.attributes;

          expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
          expect(attrs).toEqual(
            expect.objectContaining({
              name: 'Awesome skies.',
              description: 'Meet and greet with fanatical sky divers.',
            })
          );
        });
      })
    );
  });

  it('requests a new auth token using client credentials if refresh token has exipred', () => {
    const { sdk, sdkTokenStore, adapterTokenStore } = createSdk();

    // First, call API to gain access token
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const token1 = sdkTokenStore.getToken();
        expect(token1.access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);
        expect(token1.refresh_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-refresh-1`);

        adapterTokenStore.expireAccessToken(token1.access_token);
        adapterTokenStore.expireRefreshToken(token1.refresh_token);

        return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(res => {
          const token2 = sdkTokenStore.getToken();
          expect(token2.access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-2`);
          expect(token2.refresh_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-refresh-2`);

          const resource = res.data.data;
          const attrs = resource.attributes;

          expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
          expect(attrs).toEqual(
            expect.objectContaining({
              name: 'Awesome skies.',
              description: 'Meet and greet with fanatical sky divers.',
            })
          );
        });
      })
    );
  });

  it('revokes token', () => {
    const { sdk, sdkTokenStore } = createSdk();

    // First, call API to gain access token
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        expect(sdkTokenStore.getToken().access_token).toEqual(
          `${CLIENT_ID}-${CLIENT_SECRET}-access-1`
        );

        // Revoke token
        return sdk.revoke().then(res => {
          expect(res.data.action).toEqual('revoked');

          expect(sdkTokenStore.getToken()).toEqual(null);
        });
      })
    );
  });

  it('refreshes token before revoke', () => {
    const { sdk, sdkTokenStore, adapterTokenStore } = createSdk();

    // First, call API to gain access token
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const { access_token } = sdkTokenStore.getToken();
        expect(access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);

        adapterTokenStore.expireAccessToken(access_token);

        // Revoke token
        return sdk.revoke().then(res => {
          expect(res.data.action).toEqual('revoked');
          expect(sdkTokenStore.getToken()).toEqual(null);
        });
      })
    );
  });

  it('refreshes token after unsuccessful revoke, but if the refresh fails because of 401, return OK.', () => {
    const { sdk, sdkTokenStore, adapterTokenStore } = createSdk();

    // First, call API to gain access token
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const { access_token, refresh_token } = sdkTokenStore.getToken();
        expect(access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);

        adapterTokenStore.expireAccessToken(access_token);
        adapterTokenStore.revokeClientCredentialsToken(refresh_token);

        // Revoke token
        return sdk.revoke().then(() => {
          expect(sdkTokenStore.getToken()).toEqual(null);
        });
      })
    );
  });

  it('refreshes token after unsuccessful revoke, but if the refresh fails because of network error, fail.', () => {
    const { sdk, sdkTokenStore, adapterTokenStore, adapter } = createSdk();

    // Two requests passes (show marketplace and first revoke try), but after that the server goes down
    adapter.offlineAfter(2);

    // First, show marketplace
    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const { access_token, refresh_token } = sdkTokenStore.getToken();
        expect(access_token).toEqual(`${CLIENT_ID}-${CLIENT_SECRET}-access-1`);

        adapterTokenStore.expireAccessToken(access_token);
        adapterTokenStore.revokeClientCredentialsToken(refresh_token);

        // Revoke token
        return sdk
          .revoke()
          .then(() => {
            // Should not pass
            expect(true).toEqual(false);
          })
          .catch(() => {
            expect(sdkTokenStore.getToken().access_token).toEqual(access_token);
            expect(sdkTokenStore.getToken().refresh_token).toEqual(refresh_token);
          });
      })
    );
  });

  it('requests the server to send back Transit JSON Verbose', () => {
    const { sdk, adapter } = createSdk({ transitVerbose: true });

    return report(
      sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
        const req = _.last(adapter.requests);
        expect(req.headers).toEqual(
          expect.objectContaining({
            'X-Transit-Verbose': 'true',
            Accept: 'application/transit+json',
          })
        );
      })
    );
  });

  describe('authInfo', () => {
    it('returns authentication information', () => {
      const { sdk } = createSdk();

      return report(
        sdk
          .authInfo()
          .then(authInfo => {
            // No auth info yet.
            expect(authInfo.grantType).toBeUndefined();
          })
          .then(() =>
            sdk.marketplace
              .show()
              .then(sdk.authInfo)
              .then(authInfo => {
                // Client credentials token
                expect(authInfo.grantType).toEqual('refresh_token');
              })
          )
          .then(() =>
            sdk
              .revoke()
              .then(sdk.authInfo)
              .then(authInfo => {
                expect(authInfo.grantType).toBeUndefined();
              })
          )
          .then(() =>
            sdk
              .revoke()
              .then(sdk.authInfo)
              .then(authInfo => {
                // Logging out already logged out user does nothing
                expect(authInfo.grantType).toBeUndefined();
              })
          )
      );
    });
  });

  it('returns error in expected error format, data as plain text', () => {
    const { sdk } = createSdk({ clientSecret: 'some-client-secret' });

    return report(
      sdk.marketplace
        .show()
        .then(() => {
          // Fail
          expect(true).toEqual(false);
        })
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
          expect(e).toEqual(
            expect.objectContaining({
              status: 401,
              statusText: 'Unauthorized',
              data: 'Unauthorized',
            })
          );
          return Promise.resolve();
        })
    );
  });
});
