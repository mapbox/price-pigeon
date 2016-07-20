[![CircleCI](https://circleci.com/gh/mapbox/price-pigeon.svg?style=svg&circle-token=e74befa20ccba29ae651dfef1a46a827e3e75f23)](https://circleci.com/gh/mapbox/price-pigeon)

![price-pigeon](./price-pigeon.jpg)

#### Price Pigeon

The answer to [inconsistent spot price bids](https://github.com/mapbox/spotswap-cfn/issues/22).

Uses the [AWS Price List API](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/) to generate a mapping of OnDemand prices by instance type. This mapping can be referenced during instance creation to make accurate spot bid prices.

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
- If your project isn't already set up to use private `@mapbox`-scoped modules, follow the [instructions here](https://github.com/mapbox/platform/blob/master/docs/npm.md#add-a-private-module-as-a-dependency-of-another-project).

- If you already use private modules, install `price-pigeon` and add to your `package.json`:
```
npm install @mapbox/price-pigeon --save
```

- [Optional] Update the price map to use the most recent OnDemand prices:
```
$ npm run update
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
var priceMap = require('@mapbox/price-pigeon');

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
