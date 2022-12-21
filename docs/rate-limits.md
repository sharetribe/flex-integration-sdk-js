# Rate limits

The SDK can be configured to use client-side rate limits. This can help
implementations stay within the API rate limits in dev and demo marketplace
environments that the Integration API enforces. It is recommended to use
client-side rate limits for production, as well.

The SDK accepts two rate limiters as configuration: the `queryLimiter` applies
to all API queries (i.e. reading data from the API) and the `commandLimiter`
applies to all API commands (i.e. write operations that create, update data,
etc).

## Dev and demo marketplace environments

**Example:**

```js
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.devQueryLimiterConfig
);

const commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.devCommandLimiterConfig
);

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: "<your Client ID>",
  clientSecret: "<your Client secret>",
  queryLimiter: queryLimiter,
  commandLimiter: commandLimiter,
});
```

## Production marketplace environments

**Example using recommended rate limits:**

```js
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.prodQueryLimiterConfig
);

const commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.prodCommandLimiterConfig
);

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: "<your Client ID>",
  clientSecret: "<your Client secret>",
  queryLimiter: queryLimiter,
  commandLimiter: commandLimiter,
});
```

## Custom rate limits

The `createRateLimiter()` constructor takes a config object with:

- `bucketInitial`: initial token bucket size
- `bucketIncreaseAmount`: number of tokens added to the bucket every
  `bucketIncreaseInterval` milliseconds
- `bucketIncreaseInterval`: every this many milliseconds a
  `bucketIncreaseAmount` number of tokens are added to the bucket
- `bucketMaximum`: maximum size of the bucket

**Example:**

```js
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

// 100 initial requests and then 2 requests per 500ms (i.e. 4 requests per second)
const queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter({
  bucketInitial: 100,
  bucketIncreaseAmount: 2,
  bucketIncreaseInterval: 500,
  bucketMaximum: 100,
});

// 100 initial requests and then 1 request per second
const commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter({
  bucketInitial: 100,
  bucketIncreaseAmount: 1,
  bucketIncreaseInterval: 1000,
  bucketMaximum: 100,
});

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: "<your Client ID>",
  clientSecret: "<your Client secret>",
  queryLimiter: queryLimiter,
  commandLimiter: commandLimiter,
});
```
