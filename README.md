# Sharetribe Flex Integration SDK for JavaScript

Use Sharetribe Flex Integration API with ease.

[![CircleCI](https://circleci.com/gh/sharetribe/flex-integration-sdk-js.svg?style=svg&circle-token=5d118cf6f162884ba97e421c29c94f5c848ba28a)](https://circleci.com/gh/sharetribe/flex-integration-sdk-js)

## Table of Contents

* [What is it?](#what-is-it)
* [Installation](#installation)
* [Usage](#usage)
* [Examples](#examples)
* [Documentation](#documentation)
* [License](#license)

## What is it?

The SDK is the **easiest** way to interact with Sharetribe Flex Integration API.

It handles **groundwork** such as authentication, renewing authentication tokens
and serializing and deserializing data to and from JavaScript data structures.

This lets you to **concentrate on building your integration** instead
of setting up the necessary boilerplate to communicate with the API.

## Installation

Yarn:

```sh
yarn add sharetribe-flex-integration-sdk
```

## Usage

```js
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

// Create new SDK instance
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: '<Your Client ID here>',
  clientSecret: '<Your Client secret here>'
});

// Query first 5 listings
integrationSdk.listings
  .query({ perPage: 5 })
  .then(res => {
    // Print listing titles
    res.data.data.forEach(listing => {
      console.log(`Listing: ${listing.attributes.title}`)
    });
  })
  .catch(res => {
    // An error occurred
    console.log(`Request failed with status: ${res.status} ${res.statusText}`);
  });
```

Client ID and client secret are required to create a new SDK instance.
See [this article](https://www.sharetribe.com/docs/integrations/getting-started-with-integration-api/#create-integration-api-application-in-flex-console)
to learn how to get them.

## Examples

See the
[flex-integration-api-examples](https://github.com/sharetribe/flex-integration-api-examples)
repository on GitHub.

## Documentation

[Documentation can be found
here](https://sharetribe.github.io/flex-integration-sdk-js/).

## Changelog

See
[CHANGELOG.md](https://github.com/sharetribe/flex-integration-sdk-js/blob/master/CHANGELOG.md).

## License

Distributed under [The Apache License, Version
2.0](https://github.com/sharetribe/flex-integration-sdk-js/tree/master/LICENSE)
