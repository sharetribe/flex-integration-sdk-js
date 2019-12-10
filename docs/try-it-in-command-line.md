# Try it in command-line!

The SDK ships with a command-line REPL that can be used to try out the
SDK.

To start the REPL, go to the directory where you cloned the SDK Git repository and type:

```
$ yarn run repl
```

Then copy-paste the following commands to the REPL:

Set your clientId:

```js
const clientId = "<your client ID here>";
const clientSecret = "<your client secret here>"
```

Create new SDK instance:

```js
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId,
  clientSecret
});
```

Fetch 10 listings:

```js
integrationSdk.listings.query({per_page: 10}).then(response => {
  console.log("Fetched " + response.data.data.length + " listings.");
  response.data.data.forEach(listing => {
    console.log(listing.attributes.title);
  });
});
```
