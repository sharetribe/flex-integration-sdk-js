# Keep-Alive

By default, the SDK configures the Node.js `http.Agent` and `https.Agent` to
reuse connections across requests. This improves performance, since with HTTPS
connections, the SSL handshake can add up significant overhead for each new
connection.

Using persistent Keep-Alive connections is **recommended**.

If you need to disable this default behavior, the SDK can be configured to use
custom `httpAgent` and `httpsAgent`, where the `keepAlive` can be set to
`false`.

**Example:**

``` js
const express = require('express');
const http = require('http');
const https = require('https');
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const app = express();

// Instantiate HTTP(S) Agents with keepAlive set to false.
// This can increase the request time for consecutive requests,
// because each connection has to be set up separately.
// Set `maxSockets` value to 10 or less.
const httpAgent = new http.Agent({ keepAlive: false, maxSockets: 10 });
const httpsAgent = new https.Agent({ keepAlive: false, maxSockets: 10 });

app.get('/', (req, res) => {
  // Initialize the SDK instance
  const integrationSdk = sharetribeIntegrationSdk.createInstance({
    clientId: "<your Client ID>",
    clientSecret: "<your Client secret>",
    httpAgent: httpAgent,
    httpsAgent: httpsAgent
  });

  // Call the SDK to load listings
  integrationSdk.listings.search({ ... }).then((listingsResult) => {
    // do rendering etc.
  });
});
```
