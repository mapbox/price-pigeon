[![CircleCI](https://circleci.com/gh/mapbox/price-pigeon.svg?style=svg&circle-token=e74befa20ccba29ae651dfef1a46a827e3e75f23)](https://circleci.com/gh/mapbox/price-pigeon)

![price-pigeon](./price-pigeon.jpg)
> illustration by [Joseph Wilkins](https://brightonillustrators.co.uk/portfolios/Joseph_Wilkins)

#### Price Pigeon

The answer to [inconsistent spot price bids](https://github.com/mapbox/spotswap-cfn/issues/22).

Uses the [AWS Price List API](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/) to generate a mapping of OnDemand prices by instance type. This mapping can be used during instance creation to make accurate spot bid prices.

*Note: The price supplied is the highest OnDemand price for that instance type across the following regions:
```
    {
        'US East (N. Virginia)': 'us-east-1',
        'US West (N. California)': 'us-west-1',
        'US West (Oregon)': 'us-west-2',
        'Asia Pacific (Sydney)': 'ap-southeast-2',
        'EU (Ireland)': 'eu-west-1',
    };
```

#### Using Price Pigeon
- install `price-pigeon` and add to your `package.json`:
```
npm install @mapbox/price-pigeon --save
```

- [Optional] Update the price map to use the most recent OnDemand prices:
```
cd node_modules/price-pigeon
npm run update
```
- Add your `InstanceType` to the template `Parameters` if it isn't there already. The template will use a [function](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html) that refers to `InstanceType` to get the correct price. Here's an example:
```
'Parameters' : {
  'InstanceType' : {
    'Description' : 'Type of spot instance to launch',
    'Type' : 'String',
    'Default' : 'm3.xlarge', /* This is the type of instance you're launching */
    'AllowedValues' : ['m3.xlarge', 'r3.large']
  }
}

```
- Include the price map directly in your CloudFormation `template.js` (check out `price-pigeon/examples/` for a sample template):

```
// require the price-mapping function
var priceMapper = require('@mapbox/price-pigeon').priceMapper;
// get a price map with 50% off prices
var priceMap = priceMapper(0.5);
// If you want to use the actual price, you don't need to supply a ratio:
priceMap = priceMapper();

// Don't forget to add the rest of your template to this stub!
module.exports = {
  'AWSTemplateFormatVersion' : '2010-09-09',
  'Description' : 'price pigeon',
  'Mappings' :   {
    'Prices' : priceMap
  },
  'Resources' : {
    'LaunchConfiguration' : {
      'Properties' : {
        'SpotPrice' : {
          'Fn::FindInMap' : ['Prices', {'Ref' : 'InstanceType'}, 'price']
        }
      }
    }
  },
  'Parameters' : {
    'InstanceType' : {
      'Description' : 'Type of spot instance to launch',
      'Type' : 'String',
      'Default' : 'm3.xlarge',
      'AllowedValues' : ['m3.xlarge', 'r3.xlarge']
    }
  }
};
```


- Create your new stack:

```
$ cfn-update -t [templateFile] -r [region] -n [nameOfNewStack]
```
