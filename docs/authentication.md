# Authentication

The SDK is ready to make API calls as soon as it is instantiated. It will
automatically use the Sharetribe Authentication API to obtain access and refresh
tokens.

## Revoke refresh token

**`integrationSdk.revoke() : Promise`**

Revokes the current refresh token and returns a Promise.

The SDK automatically obtains access and refresh tokens from the [Sharetribe
Authentication
API](https://www.sharetribe.com/api-reference/authentication.html). It uses the
configured [token store](./token-store.md) to hold the tokens. If the store is
persistent (such as the provided `fileStore`), the long-lived refresh token is
left in storage and can be reused in subsequent SDK executions. You can
explicitly use the `revoke()` method to revoke that token and make sure it is no
longer usable.

## Obtain authentication information

**`integrationSdk.authInfo() : Promise(Object)`**

Returns a Promise with an Object as a value. The object may contain a
`grantType` field with either `'client_credentials'`,
`'refresh_token'` as a value. The different values have the following
meanings:

* No grant type: the SDK hasn't yet authenticated itself (i.e. hasn't done any
  requests to the API yet).
* Grant type `'client_credentials'`: the SDK has authenticated using the client
  ID and client secret.
* Grant type `'refresh_token'`: the SDK has authenticated using a previously
  obtained refresh token. It will do so automatically whenever the current
  access token expires.

**Please note:** Even thought the `authInfo` method returns a Promise,
the method does not call the API. The authentication information is
saved locally in the [token store](./token-store.md).
