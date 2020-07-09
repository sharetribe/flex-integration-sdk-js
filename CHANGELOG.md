# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a
Changelog](http://keepachangelog.com/en/1.0.0/) and this project
adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased] - xxxx-xx-xx

## v1.2.0 - 2020-07-09

### Added

- New endpoints [#16](https://github.com/sharetribe/flex-integration-sdk-js/pull/16)
  - `integrationSdk.transactions.transition(/* ... */)`
  - `integrationSdk.transactions.transitionSpeculative(/* ... */)`
  - `integrationSdk.transactions.updateMetadata(/* ... */)`

### Security

- Update dependencies
  - handlebars [#14](https://github.com/sharetribe/flex-integration-sdk-js/pull/14)
  - websocket-extensions [#15](https://github.com/sharetribe/flex-integration-sdk-js/pull/15)

## v1.1.0 - 2020-01-21

### Added

- New endpoints [#13](https://github.com/sharetribe/flex-integration-sdk-js/pull/13)
  - `integrationSdk.users.updateProfile(/* ... */)`
  - `integrationSdk.listings.update(/* ... */)`
  - `integrationSdk.listings.approve(/* ... */)`
  - `integrationSdk.listings.open(/* ... */)`
  - `integrationSdk.listings.close(/* ... */)`
  - `integrationSdk.images.upload(/* ... */)`
  - `integrationSdk.availabilityExceptions.query(/* ... */)`
  - `integrationSdk.availabilityExceptions.create(/* ... */)`
  - `integrationSdk.availabilityExceptions.delete(/* ... */)`

## v1.0.0 - 2019-12-10

This is the first version that is published in NPM.

See: https://www.npmjs.com/package/sharetribe-flex-integration-sdk
