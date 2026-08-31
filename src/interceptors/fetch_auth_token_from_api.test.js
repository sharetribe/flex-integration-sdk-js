import FetchAuthTokenFromApi from './fetch_auth_token_from_api';
import contextRunner from '../context_runner';

jest.mock('../context_runner', () => {
  const mockInnerFn = jest.fn();
  return jest.fn(() => mockInnerFn);
});

describe('FetchAuthTokenFromApi', () => {
  beforeEach(() => {
    contextRunner.mockClear();
  });

  it('should only fetch one token when called concurrently', async () => {
    const mockAuthToken = { access_token: 'new_token' };
    const tokenStore = {
      getToken: () => Promise.resolve(null),
      setToken: jest.fn(),
    };

    const endpointInterceptors = {
      auth: {
        token: [
          {
            enter: jest.fn(ctx => Promise.resolve({ ...ctx, res: { data: mockAuthToken } })),
          },
        ],
      },
    };

    const mockContextRunnerInnerFn = jest.fn(ctx =>
      // Simulate the behavior of contextRunner by calling the enter method of the interceptor
      endpointInterceptors.auth.token[0]
        .enter(ctx)
        .then(res => ({ ...res, authToken: mockAuthToken }))
    );
    contextRunner.mockImplementation(() => mockContextRunnerInnerFn);

    const interceptor = new FetchAuthTokenFromApi();

    const ongoingRequests = new Map();
    const ctx1 = {
      tokenStore,
      endpointInterceptors,
      clientId: 'test_client',
      clientSecret: 'test_secret',
      ongoingRequests,
    };

    const ctx2 = {
      tokenStore,
      endpointInterceptors,
      clientId: 'test_client',
      clientSecret: 'test_secret',
      ongoingRequests,
    };

    const promise1 = interceptor.enter(ctx1);
    const promise2 = interceptor.enter(ctx2);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1.authToken).toEqual(mockAuthToken);
    expect(result2.authToken).toEqual(mockAuthToken);
    expect(mockContextRunnerInnerFn).toHaveBeenCalledTimes(1);
    expect(endpointInterceptors.auth.token[0].enter).toHaveBeenCalledTimes(1);
  });

  it('should not fetch a token if one already exists in ctx', async () => {
    const existingAuthToken = { access_token: 'existing_token' };
    const interceptor = new FetchAuthTokenFromApi();

    const ctx = {
      authToken: existingAuthToken,
      tokenStore: {},
      endpointInterceptors: {},
      clientId: 'test_client',
      clientSecret: 'test_secret',
    };

    const result = await interceptor.enter(ctx);

    expect(result.authToken).toEqual(existingAuthToken);
    expect(contextRunner).not.toHaveBeenCalled();
  });
});
