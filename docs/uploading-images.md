# Uploading images

Images can be uploaded by using the `images.upload(params)` function. The
`params` object needs to contain an attribute called `image`. The value of the
attribute can be a file stream or a string denoting a path to a file.

Example usage:

```js
const fs = require('fs');
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const clientId = "<your client ID here>";
const clientSecret = "<your client secret here>"

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});


// Using a string param
integrationSdk.images.upload({image: '/path/to/file'});

// Using a file stream param
const readStream = fs.createReadStream('/path/to/file');
integrationSdk.images.upload({image: readStream})
```
