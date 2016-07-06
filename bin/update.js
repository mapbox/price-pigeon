#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var output = 'mapping.json'
// make api call

    // (probably skip this, always looking for EC2s) get offer code for ec2s from Offer Index
        // response['offers']['AmazonEC2'][]
        // https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json

var priceURL = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';
var map = {};

console.log('requesting...');

// Get API response
request(priceURL, function (error, response, body) {
    console.log('got response');
    if (error) {
        console.log('Error requesting priceURL:', error);
    } else {
        var info = JSON.parse(response.body);
        map = parseResponse(info);
    };

});

// Parses API response into legible object
function parseResponse(response) {
    var mapping = {};
    // loop through each product
    _.each(response.products, function(product) {
        // only get Linux products for now
        if (product.attributes.operatingSystem) {
            if (product.attributes.operatingSystem === 'Linux') {

                var region = product.attributes.location;
                var instanceType = product.attributes.instanceType;
                var sku = product.sku;
                if (!mapping[region]) {
                    mapping[region] = {};
                }
                // mapping[region] = [instanceType];
                mapping[region][instanceType] = sku;
            }
        }
    });
    console.log('mapping:', mapping);
    return mapping;
}

// for each item in products, if operating system and if os===linux,
// add region to master list, add instance type+sku to region

// for each region, for each item in regions, get price for sku and add



    // request https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json
        // get SKUs for instances in correct regions, with correct operating systems
            // get price within that file using SKU

            // need: sku, attributes: location, instanceType, operatingSystem
                // check that it has these attrs...
                    // ...because some things don't have operating systems: "productFamily" : "IP Address", "Data Transfer", "Dedicated Host", etc
                // list/dictionary of excluded regions, families, types?

// need lookup table for region codes >:(

// save results in mapping.json

// {
//   "us-east-1": {
//     "m3.xlarge": 0.27,
//     "m3.2xlarge": 2.09
//   },
//   "us-west-1": {
//     "m3.xlarge": 0.21,
//     "m3.2xlarge": 0.01
//   }
// }

