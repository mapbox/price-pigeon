![price-pigeon](./price-pigeon.jpg)

#### Price Pigeon

The answer to [inconsistent spot price bids](https://github.com/mapbox/spotswap-cfn/issues/22).

Uses the [AWS Price List API](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/) to generate a mapping of on-demand prices by instance type and. This mapping can be referenced in instance creation to make accurate spot bid prices.

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

- Install price-pigeon:
```
```

- Update the price map to use the most recent OnDemand prices:
```
$ npm run update
```

- Include the price map directly in your Cloud Formation template.js (check out `price-pigeon/examples/` for a sample template):

```
var mapping = require( ...

// You'll need to add your own template code to this as well!
module.exports = {
  "AWSTemplateFormatVersion" : "2010-09-09",
  "Description" : "price pigeon",
  "Mappings" :   {
    "Prices" : mapping
  },
  "Resources" : {
    "LaunchConfiguration" : {
      "Properties" : {
        "SpotPrice" : {
          "Fn::FindInMap" : ["Prices", {"Ref" : "InstanceType"}, "price"]
        }
      }
    }
  }
};
```


- Create your new stack:

```
$ cfn-update -t [templateFile] -r [region] -n [nameOfNewStack]
```
