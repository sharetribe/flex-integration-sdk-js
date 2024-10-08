# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a
Changelog](http://keepachangelog.com/en/1.0.0/) and this project
adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased] - xxxx-xx-xx

## [v1.11.0] - 2024-10-08

- New endpoints [#72](https://github.com/sharetribe/flex-integration-sdk-js/pull/72)
  - `integrationSdk.users.approve(/* ... */)`
  - `integrationSdk.users.updatePermissions(/* ... */)`

## [v1.10.1] - 2024-05-28

### Fixed

- Bug: Integration SDK failed to send any extended data if it had a key `length`
  with a number type value. [#71](https://github.com/sharetribe/flex-integration-sdk-js/pull/71)

### Changed

- Remove references to Flex in documentation. [#69](https://github.com/sharetribe/flex-integration-sdk-js/pull/69)

## [v1.10.0] - 2023-09-27

### Changed

- Update Axios to newest version. The new version will improve performance by
  enabling gzip compression.
  [#68](https://github.com/sharetribe/flex-integration-sdk-js/pull/68)

## [v1.9.0] - 2022-12-21

### Changed

- Limit concurrent requests by default
  [#57](https://github.com/sharetribe/flex-integration-sdk-js/pull/57)
- Send custom `User-Agent` string for SDK calls
  [#60](https://github.com/sharetribe/flex-integration-sdk-js/pull/60)

### Added

- Add support for using client side rate limiters
  [#58](https://github.com/sharetribe/flex-integration-sdk-js/pull/58)

## [v1.8.0] - 2022-05-05

### Added

- New endpoint [#52](https://github.com/sharetribe/flex-integration-sdk-js/pull/52)
  - `integrationSdk.listings.create(/* ... */)`

### Changed

- Read response data as Transit only if Content-Type header is
  `application/transit+json`
  [#53](https://github.com/sharetribe/flex-integration-sdk-js/pull/53)

## [v1.7.0] - 2021-10-06

### Added

- Ability to serialize an array of SDK types, i.e. array of UUIDs. Useful when
  calling e.g. `sdk.listings.query` with `ids` parameter.
  [#45](https://github.com/sharetribe/flex-integration-sdk-js/pull/45)

### Security

- Update dependencies
  [#40](https://github.com/sharetribe/flex-integration-sdk-js/pull/40)
  [#44](https://github.com/sharetribe/flex-integration-sdk-js/pull/44)

## [v1.6.1] - 2021-09-20

### Security

- Update Axios to 0.21.2 [#41](https://github.com/sharetribe/flex-integration-sdk-js/pull/41)

## [v1.6.0] - 2021-09-20

### Added

- New endpoints [#35](https://github.com/sharetribe/flex-integration-sdk-js/pull/35)
  - `integrationSdk.stockAdjustments.query(/* ... */)`
  - `integrationSdk.stockAdjustments.create(/* ... */)`
  - `integrationSdk.stock.compareAndSet(/* ... */)`
  - `integrationSdk.stockReservations.show(/* ... */)`

### Security

- Update Axios to 0.21.1 [#28](https://github.com/sharetribe/flex-integration-sdk-js/pull/28)
- Update Lodash to 4.17.21 [#33](https://github.com/sharetribe/flex-integration-sdk-js/pull/33)
- Update development dependencies with security vulnerabilities (multiple PRs)

## [v1.5.0] - 2021-08-04

### Changed

- SDK shows a warning if Client Secret is used in a browser.
  [#36](https://github.com/sharetribe/flex-integration-sdk-js/pull/36)

## [v1.4.0] - 2020-12-15

### Added

- New endpoint [#24](https://github.com/sharetribe/flex-integration-sdk-js/pull/24)
  - `integrationSdk.events.query(/* ... */)`

### Changed

- The default base URL for the Flex Integration API is now
  `https://flex-integ-api.sharetribe.com`. Using the previous
  `https://flex-api.sharetribe.com` is now DEPRECATED.

### Security

- Update dependencies
  - lodash [#19](https://github.com/sharetribe/flex-integration-sdk-js/pull/19)
  - elliptic [#20](https://github.com/sharetribe/flex-integration-sdk-js/pull/20)
  - highlight.js [#23](https://github.com/sharetribe/flex-integration-sdk-js/pull/23)
  - ini [#25](https://github.com/sharetribe/flex-integration-sdk-js/pull/25)
  - dot-prop [#26](https://github.com/sharetribe/flex-integration-sdk-js/pull/26)

## [v1.3.0] - 2020-08-12

### Added

- A utility function to convert an object query parameter into a URL compatible
  string. [21](https://github.com/sharetribe/flex-integration-sdk-js/pull/21)

## [v1.2.0] - 2020-07-09

### Added

- New endpoints [#16](https://github.com/sharetribe/flex-integration-sdk-js/pull/16)
  - `integrationSdk.transactions.transition(/* ... */)`
  - `integrationSdk.transactions.transitionSpeculative(/* ... */)`
  - `integrationSdk.transactions.updateMetadata(/* ... */)`

### Security

- Update dependencies
  - handlebars [#14](https://github.com/sharetribe/flex-integration-sdk-js/pull/14)
  - websocket-extensions [#15](https://github.com/sharetribe/flex-integration-sdk-js/pull/15)

## [v1.1.0] - 2020-01-21

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

[unreleased]: https://github.com/sharetribe/flex-integration-sdk-js/compare/v1.10.1...HEAD

[v1.11.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.10.1...v1.11.0
[v1.10.1]: https://github.com/sharetribe/flex-sdk-js/compare/v1.10.0...v1.10.1
[v1.10.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.9.0...v1.10.0
[v1.9.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.8.0...v1.9.0
[v1.8.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.7.0...v1.8.0
[v1.7.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.6.1...v1.7.0
[v1.6.1]: https://github.com/sharetribe/flex-sdk-js/compare/v1.6.0...v1.6.1
[v1.6.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.5.0...v1.6.0
[v1.5.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.2.0...v1.3.0
[v1.3.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/sharetribe/flex-sdk-js/compare/v1.0.0...v1.1.0
