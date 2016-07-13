[![CircleCI](https://circleci.com/gh/mapbox/price-pigeon.svg?style=svg&circle-token=e74befa20ccba29ae651dfef1a46a827e3e75f23)](https://circleci.com/gh/mapbox/price-pigeon)

![price-pigeon](./price-pigeon.jpg)

#### Price Pigeon

The answer to [inconsistent spot price bids](https://github.com/mapbox/spotswap-cfn/issues/22).

Uses the [AWS Price List API](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/) to generate a mapping of on-demand prices by instance type and region. This mapping can be referenced in instance creation to make accurate spot bid prices.

