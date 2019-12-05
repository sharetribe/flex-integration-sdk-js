# Configurations

There are a few configuration options that can given to the
`createInstance` method:

``` js
const sharetribeIntegrationSdk = require('sharetribe-flex-sdk');

var integrationSdk = sharetribeIntegrationSdk.createInstance({

  // The API Client ID and client secret (mandatory)
  clientId: "<your client ID here>",
  clientSecret: "<your client secret here>",

  // List of custom type handlers
  typeHandlers: [
    {
      sdkType: UUID,
      appType: MyUuidType,

      // Writer fn type signature must be:
      // appType -> sdkType
      //
      // E.g.
      // MyUuidType -> UUID
      writer: v => new UUID(v.myUuid),

      // Reader fn type signature must be:
      // sdkType -> appType
      //
      // E.g.
      // UUID -> MyUuidType
      reader: v => new MyUuidType(v.uuid),
    }
  ],

  // HTTP and HTTPS agents to be used when performing
  // http and https request. This allows defining non-default
  // options for agent, such as `{ keepAlive: false }`.
  httpAgent: httpAgent,
  httpsAgent: httpsAgent,

  // Token store
  tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore(),

  // SDK uses Transit format to communicate with the API.
  // If this configuration is `true` a verbose Transit mode is enabled.
  // Useful for development.
  // Default: false
  transitVerbose: false,

  // The API base URL (optional)
  // Defaults to Sharetribe production (https://flex-api.sharetribe.com)
  // Change this if you want to point the SDK to somewhere else (like localhost).
  // Useful mainly for Sharetribe's internal development
  baseUrl: "https://the-api-base-url.example.sharetribe.com/"

});
```
