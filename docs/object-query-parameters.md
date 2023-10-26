# Object query parameters

Some endpoints in the Sharetribe Integration API require a specific syntax that allows
passing one or more key-value pairs as the value of a single query parameter.
The keys and values are colon-separated whereas the pairs are separated by
semicolons. For example, when requesting custom image variants:

``` js
integrationSdk.listings.show({
  id: listingId,
  include: ["images"],
  "fields.image": ["variants.my-variant"],
  "imageVariant.my-variant": "w:640;h:1280;fit:scale"
}).then(res => {
  // res.data contains the response data
});
```

To simplify building requests like these, the SDK provides a utility method:
`sharetribeIntegrationSdk.util.objectQueryString`. It serializes an object into the correct
string syntax. Using this method, the request above can be written as follows:

``` js
const sdkUtil = sharetribeIntegrationSdk.util;

integrationSdk.listings.show({
  id: listingId,
  include: ["images"],
  "fields.image": ["variants.my-variant"],
  "imageVariant.my-variant": sdkUtil.objectQueryString({
    w: 640,
    h: 1280,
    fit: 'scale'
  })
}).then(res => {
  // res.data contains the response data
});
```
