import contextRunner from '../context_runner';
import SaveToken from './save_token';
import AddAuthTokenResponse from './add_auth_token_response';

/**
   If there's no `authToken` stored to the `ctx`, try to fetch new auth token from the API.

   Changes to the `ctx`:

   - add `authToken`
*/
export default class FetchAuthTokenFromApi {
  enter(ctx) {
    const {
      tokenStore,
      authToken,
      endpointInterceptors,
      clientId,
      clientSecret,
      ongoingRequests,
    } = ctx;

    if (authToken) {
      return ctx;
    }

    const requestKey = `fetch_from_api:${clientId}`;
    if (ongoingRequests.has(requestKey)) {
      return ongoingRequests.get(requestKey).then(({ authToken: newAuthToken }) => ({
        ...ctx,
        authToken: newAuthToken,
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
    })
      .then(res => {
        ongoingRequests.delete(requestKey);
        return res;
      })
      .catch(err => {
        ongoingRequests.delete(requestKey);
        throw err;
      });

    ongoingRequests.set(requestKey, ongoingRequest);

    return ongoingRequest.then(({ authToken: newAuthToken }) => ({
      ...ctx,
      authToken: newAuthToken,
    }));
  }
}
