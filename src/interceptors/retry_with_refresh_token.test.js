import RetryWithRefreshToken from './retry_with_refresh_token';
import contextRunner from '../context_runner';

jest.mock('../context_runner', () => {
  const mockInnerFn = jest.fn();
  return jest.fn(() => mockInnerFn);
});

describe('RetryWithRefreshToken', () => {
  beforeEach(() => {
    contextRunner.mockClear();
    // Clear mocks of the inner function as well
    const mockInnerFn = contextRunner();
    mockInnerFn.mockClear();
  });

  it('should only fetch one token when called concurrently', async () => {
    const mockNewAuthToken = { access_token: 'new_token' };
    const tokenStore = {
      getToken: () => Promise.resolve(null),
      setToken: jest.fn(),
    };

    const endpointInterceptors = {
      auth: {
        token: [
          {
            enter: jest.fn(ctx => Promise.resolve({ ...ctx, res: { data: mockNewAuthToken } })),
          },
        ],
      },
    };

    const mockContextRunnerInnerFn = jest.fn(ctx =>
      // Simulate the behavior of contextRunner by calling the enter method of the interceptor
      endpointInterceptors.auth.token[0]
        .enter(ctx)
        .then(res => ({ ...res, authToken: mockNewAuthToken }))
    );
    contextRunner.mockImplementation(() => mockContextRunnerInnerFn);

    const interceptor = new RetryWithRefreshToken();

    const ongoingRequests = new Map();
    const initialAuthToken = { access_token: 'expired_token', refresh_token: 'valid_refresh' };

    const errorCtx1 = {
      res: { status: 401 },
      authToken: initialAuthToken,
      clientId: 'test_client',
      tokenStore,
      endpointInterceptors,
      refreshTokenRetry: { retryQueue: [], attempts: 1 },
      ongoingRequests,
    };

    const errorCtx2 = {
      ...errorCtx1,
    };

    const promise1 = interceptor.error(errorCtx1);
    const promise2 = interceptor.error(errorCtx2);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1.authToken).toEqual(mockNewAuthToken);
    expect(result2.authToken).toEqual(mockNewAuthToken);
    expect(mockContextRunnerInnerFn).toHaveBeenCalledTimes(1);
    expect(endpointInterceptors.auth.token[0].enter).toHaveBeenCalledTimes(1);
  });
});
