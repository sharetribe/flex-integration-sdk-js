import Bottleneck from 'bottleneck';
import _ from 'lodash';

/**
 Null-safe version of Object.entries
 */
export const entries = obj => {
  if (obj == null) {
    return [];
  }
  return Object.entries(obj);
};

/**
   Take URL and remove the trailing slashes.

   Example:

   ```
   trimEndSlash("http://www.api.com") => "http://www.api.com"
   trimEndSlash("http://www.api.com/") => "http://www.api.com"
   trimEndSlash("http://www.api.com//") => "http://www.api.com"
   ```
 */
export const trimEndSlash = url => _.trimEnd(url, '/');

export const fnPath = path =>
  _.without(path.split('/'), '').map(part => part.replace(/_\w/g, m => m[1].toUpperCase()));

export const formData = params =>
  entries(params)
    .reduce((pairs, entry) => {
      const [k, v] = entry;
      pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      return pairs;
    }, [])
    .join('&');

/**
   Serialize a single attribute in an object query parameter.
*/
const serializeAttribute = attribute => {
  if (_.isPlainObject(attribute)) {
    throw new Error('Nested object in query parameter.');
  } else if (Array.isArray(attribute)) {
    return attribute.join(',');
  } else {
    return attribute;
  }
};

/**
   Serializes an object into a Sharetribe API query parameter value format. Null and
   undefined object attributes are dropped.

   Example:

   {
   a: 'foo',
   b: '150',
   c: null,
   d: ['foo', 'bar'],
   }

   =>

   'a:foo;b:150;d:foo,bar'
*/
export const objectQueryString = obj => {
  if (!_.isPlainObject(obj)) {
    throw new Error('Parameter not an object.');
  }

  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}:${serializeAttribute(v)}`)
    .join(';');
};

const validateRateLimiterConfig = config => {
  const { bucketInitial, bucketIncreaseInterval, bucketIncreaseAmount, bucketMaximum } = config;

  if (bucketIncreaseInterval && bucketIncreaseInterval % 250 !== 0) {
    throw new Error('bucketIncreaseInterval must be a multiple of 250');
  }

  return { bucketInitial, bucketIncreaseInterval, bucketIncreaseAmount, bucketMaximum };
};

/**
   Good default query rate limiter configuration for dev marketplace environments.

   Example:

   ```
   queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
     sharetribeIntegrationSdk.util.devQueryLimiterConfig
   );
   ```
*/
export const devQueryLimiterConfig = {
  bucketInitial: 100,
  // 1 request per second, i.e. 60 requests per minute
  bucketIncreaseInterval: 1000,
  bucketIncreaseAmount: 1,
  bucketMaximum: 200,
};

/**
   Good default command rate limiter configuration for dev marketplace environments.

   Example:

   ```
   commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
     sharetribeIntegrationSdk.util.devCommandLimiterConfig
   );
   ```
*/
export const devCommandLimiterConfig = {
  bucketInitial: 50,
  // 1 request per 2 seconds, i.e. 30 requests per minute
  bucketIncreaseInterval: 2000,
  bucketIncreaseAmount: 1,
  bucketMaximum: 100,
};

/**
   Recommended query rate limiter configuration for production marketplace environments.

   Example:

   ```
   queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
     sharetribeIntegrationSdk.util.prodQueryLimiterConfig
   );
   ```
*/
export const prodQueryLimiterConfig = {
  bucketInitial: 500,
  // 8 requests per second, i.e. 480 requests per minute
  bucketIncreaseInterval: 250,
  bucketIncreaseAmount: 2,
  bucketMaximum: 500,
};

/**
   Recommended command rate limiter configuration for production marketplace environments.

   Example:

   ```
   commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
     sharetribeIntegrationSdk.util.prodCommandLimiterConfig
   );
   ```
*/
export const prodCommandLimiterConfig = {
  bucketInitial: 250,
  // 4 requests per second, i.e. 240 requests per minute
  bucketIncreaseInterval: 250,
  bucketIncreaseAmount: 1,
  bucketMaximum: 250,
};

/**
   Create a rate limiter suitable for use with the SDK as `queryLimiter` and `commandLimiter`.
   See also `devQueryLimiterConfig` and `devCommandLimiterConfig`.

   The `config` parameters define an initial token bucket size, rate at which the
   bucket refills and a maximum bucket size. Each request takes one token from
   the bucket. When the bucket reaches 0, requests are queued and wait until
   some tokens accumulate in the bucket.

   `config` is an object with keys:

   - bucketInitial: initial token bucket size
   - bucketIncreaseAmount: number of tokens added to the bucket every
     `bucketIncreaseInterval` milliseconds
   - bucketIncreaseInterval: every this many milliseconds a
     `bucketIncreaseAmount` number of tokens are added to the bucket
   - bucketMaximum: maximum size of the bucket

   Example:

   ```
   queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter({
     bucketInitial: 10,
     bucketIncreaseInterval: 1000,
     bucketIncreaseAmount: 1,
     bucketMaximum: 100,
   });
   commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter({
     bucketInitial: 5,
     bucketIncreaseInterval: 2000,
     bucketIncreaseAmount: 1,
     bucketMaximum: 50,
   });
   sdk = sharetribeIntegrationSdk.createInstance({
     ...
     queryLimiter: queryLimiter,
     commandLimiter: commandLimiter,
   ...
   });
   ```
*/
export const createRateLimiter = config => {
  const {
    bucketInitial,
    bucketIncreaseInterval,
    bucketIncreaseAmount,
    bucketMaximum,
  } = validateRateLimiterConfig(config);

  return new Bottleneck({
    reservoir: bucketInitial,
    reservoirIncreaseInterval: bucketIncreaseInterval,
    reservoirIncreaseAmount: bucketIncreaseAmount,
    reservoirIncreaseMaximum: bucketMaximum,
  });
};
