import _ from 'lodash';

const createTokenStore = () => {
  const tokens = [];
  let clientCredentialsAccessCount = 0;
  let clientCredentialsRefreshCount = 0;

  const knownClients = [['08ec69f6-d37e-414d-83eb-324e94afddf0', 'client-secret-value']];

  // Private

  const generateClientCredentialsAccessToken = (clientId, clientSecret) => {
    clientCredentialsAccessCount += 1;
    return `${clientId}-${clientSecret}-access-${clientCredentialsAccessCount}`;
  };

  const generateClientCredentialsRefreshToken = (clientId, clientSecret) => {
    clientCredentialsRefreshCount += 1;
    return `${clientId}-${clientSecret}-refresh-${clientCredentialsRefreshCount}`;
  };

  // Public

  const validToken = (accessToken, tokenType) =>
    _.find(
      tokens,
      ({ token }) =>
        token.access_token &&
        accessToken &&
        token.token_type &&
        tokenType &&
        token.access_token.toLowerCase() === accessToken.toLowerCase() &&
        token.token_type.toLowerCase() === tokenType.toLowerCase()
    );

  const createClientCredentialsToken = (clientId, clientSecret) => {
    const client = _.find(knownClients, u => _.isEqual(u, [clientId, clientSecret]));

    if (!client) {
      return null;
    }

    const token = {
      token: {
        access_token: generateClientCredentialsAccessToken(clientId, clientSecret),
        refresh_token: generateClientCredentialsRefreshToken(clientId, clientSecret),
        token_type: 'bearer',
        expires_in: 86400,
      },
      client: {
        clientId,
        clientSecret,
      },
    };
    tokens.push(token);

    return token.token;
  };

  const expireAccessToken = accessToken => {
    _.map(tokens, t => {
      const { token } = t;

      if (token.access_token === accessToken) {
        token.access_token = null;
      }

      return t;
    });
  };

  const revokeClientCredentialsToken = refreshToken =>
    _.remove(tokens, t => t.token.refresh_token === refreshToken);

  const freshClientCredentialsToken = refreshToken => {
    const existingToken = revokeClientCredentialsToken(refreshToken);

    if (existingToken.length) {

      const { clientId, clientSecret } = existingToken[0].client;
      return createClientCredentialsToken(clientId, clientSecret);
    }

    return null;
  };

  return {
    createClientCredentialsToken,
    freshClientCredentialsToken,
    revokeClientCredentialsToken,
    validToken,
    expireAccessToken,
  };
};

export default createTokenStore;
