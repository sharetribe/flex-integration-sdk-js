# Token store

Token store is a pluggable SDK module, that stores the authentication tokens
obtained from the [Authentication
API](https://www.sharetribe.com/api-reference/authentication.html). It allows
for [refresh tokens](https://www.sharetribe.com/api-reference/authentication.html#token-types) to be used effectively during the application execution
and, when a persistent token store is in use, across executions. Ultimately,
this helps keeping the client secret protected, as it is used less frequently on
the wire.

The SDK ships with two token store implementations. They are:

## Memory store

The memory store preserves the token information in the application memory. The
information is lost when the application terminates or if the SDK instance is
reinitialized.

This store provides a balance between security and ease of use, as it does not
require any external storage.

Example usage:

```js
const clientId = "<your client ID here>";
const clientSecret = "<your client secret here>"

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId,
  clientSecret,
  tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore()
});
```

## File store

The file store persists the token information to a file on the filesystem (in
`~/.config/flex-integration-sdk/file-store-token.json`). This allows the token
information to be reused across application invocations. Assuming that the
execution environment (server, container, computer, etc) is trusted, using the
file store reduces greatly the need to rely on the application's client secret
for obtaining access tokens.

The file store is **the recommended token store**, as long as you are aware that
sensitive token data is written to the file system.

Example usage:

```js
const clientId = "<your client ID here>";
const clientSecret = "<your client secret here>"

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId,
  clientSecret,
  tokenStore: sharetribeIntegrationSdk.tokenStore.fileStore()
});
```

## Writing your own token store

The built-in stores should cover most common use cases. However, in some cases
you may need to write your own token store. This could be, for example if:

* you want to share access tokens across multiple instances of your application,
  running on multiple machines
* you want to store the sensitive token data in a special purpose database or
  storage location

### Interface

The token store interface has three methods. Any token store
implementation must implement all of them:

**`setToken(Object) : null | Promise(null)`**

Stores the new token. Returns either `null` or a `Promise`.

**`getToken() : Object | Promise(Object)`**

Reads the token from the store. Returns either a token or a Promise
holding the token as a value.

**`removeToken : null | Promise(null)`**

Removes the stored token. Returns either `null` or a Promise.

### Examples

See the built-in token store implementations.
