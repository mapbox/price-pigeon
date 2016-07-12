var mapping = require('../map2.json');

module.exports = {
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "Oh Hello",
  "Mappings" :   {
    "Species" : {
        "mammal"      : { "Name" : "kangaroo"},
        "reptile"      : { "Name" : "python"}
    },
    "Prices" : mapping
  },

  "Parameters" : {
    "Animal" : {
        "Type" : "String",
        "Default" : "mammal",
        "AllowedValues" : ["mammal", "reptile", "bird"],
        "Description" : "Type of animal."
    },
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
        "TopicName" : {
            "Fn::FindInMap" : ["Prices", {"Ref" : "InstanceType"}, "name"]
        }
      }
    }
  }
};
