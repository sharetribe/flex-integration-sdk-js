import axios from 'axios';
import _ from 'lodash';
import http from 'http';
import https from 'https';
import sdkVersion from './version';
import { fnPath as urlPathToFnPath, trimEndSlash, formData } from './utils';
import paramsSerializer from './params_serializer';
import AddAuthHeader from './interceptors/add_auth_header';
import RetryWithRefreshToken from './interceptors/retry_with_refresh_token';
import RetryWithClientCredentials from './interceptors/retry_with_client_credentials';
import ClearTokenAfterRevoke from './interceptors/clear_token_after_revoke';
import FetchRefreshTokenForRevoke from './interceptors/fetch_refresh_token_for_revoke';
import FetchAuthTokenFromApi from './interceptors/fetch_auth_token_from_api';
import FetchAuthTokenFromStore from './interceptors/fetch_auth_token_from_store';
import AuthInfo from './interceptors/auth_info';
import MultipartRequest from './interceptors/multipart_request';
import TransitRequest from './interceptors/transit_request';
import TransitResponse from './interceptors/transit_response';
import FormatHttpResponse from './interceptors/format_http_response';
import { createDefaultTokenStore } from './token_store';
import contextRunner from './context_runner';

/* eslint-disable class-methods-use-this */

const defaultSdkConfig = {
  clientId: null,
  baseUrl: 'https://flex-integ-api.sharetribe.com',
  typeHandlers: [],
  endpoints: [],
  adapter: null,
  version: 'v1',
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 10 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 10 }),
  transitVerbose: false,
  queryLimiter: null,
  commandLimiter: null,
};

/* global window, navigator, process */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const navigatorUserAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const nodeVersion =
  typeof process !== 'undefined' && typeof process.versions !== 'undefined'
    ? process.versions.node
    : '';

// User-Agent string for the SDK
// For browsers, append to the browser's user agent string,
let sdkUserAgentString = `sharetribe-flex-integration-sdk-js/${sdkVersion}`;
if (isBrowser && navigatorUserAgent !== '') {
  sdkUserAgentString = `${navigatorUserAgent} ${sdkUserAgentString}`;
} else if (nodeVersion !== '') {
  sdkUserAgentString = `${sdkUserAgentString} (node/${nodeVersion})`;
}

/**
   Basic configurations for different 'apis'.

   Currently we have two apis:

   - `integration_api`: the Integration API
   - `auth`: the Authentication API

   These configurations will be passed to Axios library.
   They define how to do the requets to the APIs, e.g.
   how the parameters should be serialized,
   what are the headers that should be always sent and
   how to transform requests and response, etc.
 */

const createHeaders = transitVerbose => {
  if (transitVerbose) {
    return {
      'X-Transit-Verbose': 'true',
      Accept: 'application/transit+json',
    };
  }

  return {
    Accept: 'application/transit+json',
  };
};

const apis = {
  integration_api: ({ baseUrl, version, adapter, httpAgent, httpsAgent, transitVerbose }) => ({
    headers: createHeaders(transitVerbose),
    baseURL: `${baseUrl}/${version}`,
    transformRequest: v => v,
    transformResponse: v => v,
    adapter,
    paramsSerializer,
    httpAgent,
    httpsAgent,
  }),
  auth: ({ baseUrl, version, adapter, httpAgent, httpsAgent }) => ({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    baseURL: `${baseUrl}/${version}/`,
    transformRequest: [data => formData(data)],
    // using default transformRequest, which can handle JSON and fallback to plain
    // test if JSON parsing fails
    adapter,
    httpAgent,
    httpsAgent,
  }),
};

/**
   List of all known endpoints

   - apiName: api / auth
   - path: URL path to the endpoint
   - internal: Is this method SDK internal only,
     or will it be part of the public SDK interface
   - method: HTTP method
 */
const endpointDefinitions = [
  {
    apiName: 'integration_api',
    path: 'marketplace/show',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'users/show',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'users/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'users/update_profile',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'users/approve',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'users/update_permissions',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/show',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/update',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/approve',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/open',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/create',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'listings/close',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'transactions/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'transactions/show',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'transactions/transition',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'transactions/transition_speculative',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'transactions/update_metadata',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'images/upload',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new MultipartRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'availability_exceptions/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'availability_exceptions/create',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'availability_exceptions/delete',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'events/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'stock_adjustments/query',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  {
    apiName: 'integration_api',
    path: 'stock_adjustments/create',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'stock/compare_and_set',
    internal: false,
    method: 'post',
    interceptors: [new TransitResponse(), new TransitRequest()],
  },
  {
    apiName: 'integration_api',
    path: 'stock_reservations/show',
    internal: false,
    method: 'get',
    interceptors: [new TransitResponse()],
  },
  { apiName: 'auth', path: 'token', internal: true, method: 'post', interceptors: [] },
  { apiName: 'auth', path: 'revoke', internal: true, method: 'post', interceptors: [] },

  /* ******************************************************************************** */

  /*   Deprecated endpoints                                                           */

  /* ******************************************************************************** */
];

const authenticateInterceptors = [
  new FetchAuthTokenFromStore(),
  new FetchAuthTokenFromApi(),
  new RetryWithClientCredentials(),
  new RetryWithRefreshToken(),
  new AddAuthHeader(),
];

const revokeInterceptors = [
  new FetchAuthTokenFromStore(),
  new ClearTokenAfterRevoke(),
  new RetryWithRefreshToken(),
  new AddAuthHeader(),
  new FetchRefreshTokenForRevoke(),
];

/**
   Take endpoint definitions and return SDK function definition.
 */
const sdkFnDefsFromEndpointDefs = epDefs =>
  epDefs
    .filter(({ internal = false }) => !internal)
    .map(({ apiName, path, method }) => {
      const fnPath = urlPathToFnPath(path);
      const fullFnPath = [apiName, ...fnPath];

      return {
        method,
        path: fnPath,
        endpointInterceptorPath: fullFnPath,
        interceptors: [new FormatHttpResponse(), ...authenticateInterceptors],
      };
    });

/**
   List of SDK methods that will be part of the SDKs public interface.
   The list is created from the `endpointDefinitions` list.

   The objects in the list have following fields:

   - path (String | Array): The function name and path. I.e. if the path is `listings.show`,
     then there will be a public SDK method `sdk.listings.show`
   - endpointInterceptorPath (String | Array): Path to endpoint interceptor
   - interceptors: List of additional interceptors.

 */
const endpointSdkFnDefinitions = sdkFnDefsFromEndpointDefs(endpointDefinitions);

/**
   List of SDK methods that are not derived from the endpoints.
 */
const additionalSdkFnDefinitions = [
  { path: 'revoke', endpointInterceptorPath: 'auth.revoke', interceptors: [...revokeInterceptors] },
  { path: 'authInfo', interceptors: [new AuthInfo()] },
];

// GET requests: `params` includes query params. `queryParams` will be ignored
// POST requests: `params` includes body params. `queryParams` includes URL query params
const doRequest = ({ params = {}, queryParams = {}, httpOpts }) => {
  const { method = 'get', headers } = httpOpts;

  let data = null;
  let query = null;

  if (method.toLowerCase() === 'post') {
    data = params;
    query = queryParams;
  } else {
    query = params;
    // leave `data` null
  }

  const req = {
    ...httpOpts,
    headers: { ...headers, 'User-Agent': sdkUserAgentString },
    method,
    data,
    params: query,
  };

  return axios.request(req);
};

/**
   Creates a list of endpoint interceptors that call the endpoint with the
   given parameters.
*/
const createEndpointInterceptors = ({ method, url, httpOpts }) => {
  const { headers: httpOptsHeaders, ...restHttpOpts } = httpOpts;

  return {
    enter: ctx => {
      const { params, queryParams, headers, perRequestOpts } = ctx;
      return doRequest({
        params,
        queryParams,
        httpOpts: {
          ...perRequestOpts,
          method: method || 'get',
          // Merge additional headers
          headers: { ...httpOptsHeaders, ...headers },
          ...restHttpOpts,
          url,
        },
      })
        .then(res => ({ ...ctx, res }))
        .catch(error => {
          const errorCtx = { ...ctx, res: error.response };
          // eslint-disable-next-line no-param-reassign
          error.ctx = errorCtx;
          throw error;
        });
    },
  };
};

const formatError = e => {
  /* eslint-disable no-param-reassign */
  if (e.response) {
    Object.assign(e, e.response);
    delete e.response;
  }

  if (e.ctx) {
    // Remove context `ctx` from the error response.
    //
    // `ctx` is SDK internal and should be exposed as a part of the
    // SDK public API. It can be added in the response for debugging
    // purposes, if needed.
    delete e.ctx;
  }

  if (e.config) {
    // Axios attachs the config object that was used to the error.
    //
    // Remove context `config` from the error response.
    //
    // `ctx` is SDK internal and should be exposed as a part of the
    // SDK public API. It can be added in the response for debugging
    // purposes, if needed.
    delete e.config;
  }

  throw e;
  /* eslint-enable no-param-reassign */
};

const allowedPerRequestOpts = opts => _.pick(opts, ['onUploadProgress']);

const createSdkFnContextRunner = ({
  params,
  queryParams,
  perRequestOpts,
  ctx,
  interceptors,
  endpointInterceptors,
}) =>
  contextRunner(_.compact([...interceptors, ...endpointInterceptors]))({
    ...ctx,
    params,
    queryParams,
    perRequestOpts,
  })
    .then(({ res }) => res)
    .catch(formatError);
const createSdkPostFn = sdkFnParams => (params = {}, queryParams = {}, perRequestOpts = {}) =>
  createSdkFnContextRunner({
    params,
    queryParams,
    perRequestOpts: allowedPerRequestOpts(perRequestOpts),
    ...sdkFnParams,
  });
const createSdkGetFn = sdkFnParams => (params = {}) =>
  createSdkFnContextRunner({ params, ...sdkFnParams });
/**
   Creates a new SDK function.

   'sdk function' is a function that will be attached to the SDK instance.
   These functions will be part of the SDK's public interface.

   It's meant to used by the user of the SDK.
 */
const createSdkFn = ({ queryLimiter, commandLimiter, method, ...sdkFnParams }) => {
  let fn = null;

  if (method && method.toLowerCase() === 'post') {
    fn = createSdkPostFn(sdkFnParams);
    if (commandLimiter) {
      return commandLimiter.wrap(fn);
    }
    return fn;
  }

  fn = createSdkGetFn(sdkFnParams);
  if (queryLimiter) {
    return queryLimiter.wrap(fn);
  }
  return fn;
};

// Take SDK configurations, do transformation and return.
const transformSdkConfig = ({ baseUrl, tokenStore, ...sdkConfig }) => ({
  ...sdkConfig,
  baseUrl: trimEndSlash(baseUrl),
  tokenStore: tokenStore || createDefaultTokenStore(),
});

// Validate SDK configurations, throw an error if invalid, otherwise return.
const validateSdkConfig = sdkConfig => {
  if (!sdkConfig.clientId) {
    throw new Error('clientId must be provided');
  }

  if (!sdkConfig.baseUrl) {
    throw new Error('baseUrl must be provided');
  }

  /* global console */
  /* eslint-disable no-console */
  if (
    sdkConfig.httpsAgent &&
    (!sdkConfig.httpsAgent.maxSockets || sdkConfig.httpsAgent.maxSockets > 10)
  ) {
    console.warn(
      'The supplied httpsAgent does not restrict concurrent requests sufficiently and some requests may be rejected by the API.'
    );
    console.warn("In order to avoid this, set the agent's `maxSockets` value to 10 or less.");
  }

  if (isBrowser && sdkConfig.clientSecret && !sdkConfig.dangerouslyAllowClientSecretInBrowser) {
    console.warn(
      'Security warning! You are using client secret in a browser. This may expose the client secret to the public.'
    );
    console.warn(
      'If you know what you are doing and you have secured the website by other means (e.g. HTTP basic auth), you should set the SDK configuration `dangerouslyAllowClientSecretInBrowser` to `true` to dismiss this warning.'
    );
    console.warn(
      'In the future SDK versions, we may change this warning to an error causing the site not to work properly, unless `dangerouslyAllowClientSecretInBrowser` is set'
    );
  }
  /* eslint-enable no-console */

  return sdkConfig;
};

export default class SharetribeSdk {
  /**
     Instantiates a new SharetribeSdk instance.
     The constructor assumes the config options have been
     already validated.
   */
  constructor(userSdkConfig) {
    // Transform and validation SDK configurations
    const sdkConfig = validateSdkConfig(
      transformSdkConfig({ ...defaultSdkConfig, ...userSdkConfig })
    );

    const { queryLimiter, commandLimiter } = sdkConfig;

    // Instantiate API configs
    const apiConfigs = _.mapValues(apis, apiConfig => apiConfig(sdkConfig));

    // Read the endpoint definitions and do some mapping
    const endpointDefs = [...endpointDefinitions].map(epDef => {
      const { path, apiName, method, interceptors = [] } = epDef;
      const fnPath = urlPathToFnPath(path);
      const fullFnPath = [apiName, ...fnPath];
      const url = [apiName, path].join('/');
      const httpOpts = apiConfigs[apiName];

      const endpointInterceptors = [
        ...interceptors,
        createEndpointInterceptors({ method, url, httpOpts }),
      ];

      return {
        ...epDef,
        fnPath,
        fullFnPath,
        endpointInterceptors,
      };
    });

    // Create `endpointInterceptors` object, which is object
    // containing interceptors for all defined endpoints.
    // This object can be passed to other interceptors in the interceptor context so they
    // are able to do API calls (e.g. authentication interceptors)
    const endpointInterceptors = endpointDefs.reduce(
      (acc, { fullFnPath, endpointInterceptors: interceptors }) =>
        _.set(acc, fullFnPath, interceptors),
      {}
    );

    // Create a context object that will be passed to the interceptor context runner
    const ctx = {
      tokenStore: sdkConfig.tokenStore,
      endpointInterceptors,
      clientId: sdkConfig.clientId,
      clientSecret: sdkConfig.clientSecret,
      typeHandlers: sdkConfig.typeHandlers,
      transitVerbose: sdkConfig.transitVerbose,
    };

    // Create SDK functions
    const sdkFns = [...endpointSdkFnDefinitions, ...additionalSdkFnDefinitions].map(
      ({ path, method, endpointInterceptorPath, interceptors }) => ({
        path,
        fn: createSdkFn({
          queryLimiter,
          commandLimiter,
          method,
          ctx,
          endpointInterceptors: _.get(endpointInterceptors, endpointInterceptorPath) || [],
          interceptors,
        }),
      })
    );

    // Assign SDK functions to 'this'
    sdkFns.forEach(({ path, fn }) => _.set(this, path, fn));
  }
}
