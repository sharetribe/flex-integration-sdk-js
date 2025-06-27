import contextRunner from '../context_runner';
import SaveToken from './save_token';
import AddAuthTokenResponse from './add_auth_token_response';

/**
   Retries with client credentials.


   `enter`: Save current `enterQueue` to `retryQueue` and save current `attempts` count

   `error`: Try to fetch new access token. If successful, save it to `ctx`

   Changes to `ctx`:

   - add `clientCredentialsRetry`
   - add `authToken`
 */
export default class RetryWithClientCredentials {
  enter(enterCtx) {
    const { enterQueue, clientCredentialsRetry: { attempts = 0 } = {} } = enterCtx;
    return {
      ...enterCtx,
      clientCredentialsRetry: {
        retryQueue: [...enterQueue, new RetryWithClientCredentials()],
        attempts: attempts + 1,
      },
    };
  }

  error(errorCtx) {
    const {
      clientId,
      clientSecret,
      tokenStore,
      endpointInterceptors,
      clientCredentialsRetry: { retryQueue, attempts },
      ongoingRequests,
    } = errorCtx;

    if (attempts > 1) {
      return errorCtx;
    }

    if (errorCtx.res && errorCtx.res.status === 401) {
      const requestKey = `client_credentials:${clientId}`;
      if (ongoingRequests.has(requestKey)) {
        return ongoingRequests.get(requestKey).then(({ authToken: newAuthToken }) => ({
          ...errorCtx,
          authToken: newAuthToken,
          enterQueue: retryQueue,
          error: null,
        }));
      }

      const ongoingRequest = contextRunner([
        new SaveToken(),
        new AddAuthTokenResponse(),
        ...endpointInterceptors.auth.token,
      ])({
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          scope: 'integ',
        },
        tokenStore,
        ongoingRequests,
      })
        .then(res => {
          ongoingRequests.delete(requestKey);
          return res;
        })
        .catch(e => {
          ongoingRequests.delete(requestKey);
          throw e;
        });

      ongoingRequests.set(requestKey, ongoingRequest);

      return ongoingRequest
        .then(({ authToken: newAuthToken }) => ({
          ...errorCtx,
          authToken: newAuthToken,
          enterQueue: retryQueue,
          error: null,
        }))
        .catch(() => ({
          ...errorCtx,
          clientCredentialsRetry: { retryQueue, attempts },
        }));
    }

    return errorCtx;
  }
}
