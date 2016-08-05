// require the price mapping function
var priceMapper = require('@mapbox/price-pigeon').priceMapper;
// get a price map with half cost prices for each instance
var priceMap = priceMapper(0.5);

module.exports = {
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "price pigeon",
  "Mappings" :   {
    "Prices" : priceMap,
    "RegionMap": {
      "us-east-1": {
          "64": "ami-7b89cc11"
      },
      "eu-west-1": {
          "64": "ami-6514ce16"
      },
      "eu-central-1": {
          "64": "ami-02392b6e"
      },
      "us-west-1": {
          "64": "ami-809df3e0"
      },
      "us-west-2": {
          "64": "ami-d24c5cb3"
      },
      "ap-southeast-1": {
          "64": "ami-f78c4d94"
      },
      "ap-northeast-1": {
          "64": "ami-eb0a2985"
      },
      "ap-southeast-2": {
          "64": "ami-a25a03c1"
      },
      "sa-east-1": {
          "64": "ami-9f4cf6f3"
      }
    },
  },

  "Parameters" : {
    "Region" : {
        "Type" : "String",
        "Default" : "us-west-1",
        "AllowedValues" : ["us-west-1", "us-east-1"],
        "Description" : "Region"
    },
    "InstanceType" : {
        "Type" : "String",
        "Default" : "c3.xlarge",
        "AllowedValues" : ["c3.xlarge", "c3.2xlarge"],
        "Description" : "Instance type"
    }
  },

  "Resources" : {
    "Topic": {
      "Type" : "AWS::SNS::Topic",
      "Properties" : {
        "TopicName" : "Flitter"
      }
    },
    "LaunchConfiguration" : {
      "Type" : "AWS::AutoScaling::LaunchConfiguration",
      "Properties" : {
        "ImageId" : {
          "Fn::FindInMap" : ["RegionMap", {"Ref" : "AWS::Region"}, "64"]
        },
        "InstanceType" : {"Ref" : "InstanceType"},
        "SpotPrice" : {
          "Fn::FindInMap" : ["Prices", {"Ref" : "InstanceType"}, "price"]
        }
      }
    }
  }
};
