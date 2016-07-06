#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var output = 'mapping.json';

// make api call

    // (probably skip this, always looking for EC2s) get offer code for ec2s from Offer Index
        // response['offers']['AmazonEC2'][]
        // https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json

var priceURL = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';
var map = {};
var regions = {
    'US East (N. Virginia)': 'us-east-1',
    'US West (N. California)': 'us-west-1',
    'US West (Oregon)': 'us-west-2',
    'Asia Pacific (Mumbai)': 'ap-south-1',
    'Asia Pacific (Seoul)': 'ap-northeast-2',
    'Asia Pacific (Singapore)': 'ap-southeast-1',
    'Asia Pacific (Sydney)': 'ap-southeast-2',
    'Asia Pacific (Tokyo)': 'ap-northeast-1',
    'EU (Frankfurt)': 'eu-central-1',
    'EU (Ireland)': 'eu-west-1',
    'South America (São Paulo)': 'sa-east-1'
};

console.log('requesting...');

// read save api response to save time during developement
// fs.readFile('./apiResponse.json', parseResponse);
fs.readFile('./apiResponse.json', function (err, buffer) {
    // console.log('err:', err);
    // console.log('buffer:', buffer);
    // var response = JSON.parse(buffer);
    // console.log('response:', response);
    if (err) {
        console.log('err w/file read');
        return;
    } else {
        parseResponse(buffer);
    }
});

// Get API response
// request(priceURL, function (error, response, body) {
//     console.log('got response');
//     if (error) {
//         console.log('Error requesting priceURL:', error);
//     } else {
//         var info = JSON.parse(response.body);
//         map = parseResponse(info);
//     };

// });

// Parses API response into legible object
function parseResponse(bufferResponse) {
    var response = JSON.parse(bufferResponse);
    var mapping = {};
    // loop through each product
    _.each(response.products, function(product) {
        // only get Linux products for now
        if (product.productFamily === 'Compute Instance' && product.attributes.operatingSystem === 'Linux') {
                var region = product.attributes.location;
                var instanceType = product.attributes.instanceType;
                var sku = product.sku;
                mapping[sku] = {
                    'sku': sku,
                    'region': region,
                    'instanceType': instanceType
                };
                // if (!mapping[region]) {
                //     mapping[region] = {};
                // }
                // mapping[region][instanceType] = {'sku': sku};
        }
    });
    // loop through each sku, add 'price': price, 'unit': unit
    // response.terms.onDemand
    _.each(mapping, function(instance) {
        var instanceSKU = instance['sku'];
        var price = getPrice(response, instanceSKU);
        instance['price'] = price;
    })

    // var testPrice = getPrice(response, '4APTB9YMQM9QTQK3');
    // console.log('testPrice:', JSON.stringify(testPrice, null, 2));


    // loop through each instance, replace sku with price for that sku
    // get list of keys (regions) loop through regions, get list of keys/instances, loop through instances
    // use value of instance (sku) to look up price, replace sku with price
    // _.each(mapping[region])


    console.log('mapping:', mapping);
    return mapping;
}

// uses SKU to get price from response. Complicated because of json structure.
function getPrice(response, sku) {
    var price;
    var terms = response.terms.OnDemand[sku];
    if (terms) {
        // get weird AWS codes
        var skuOTC = Object.keys(terms)[0];
        var skuRC = Object.keys(terms[skuOTC].priceDimensions)[0];

        var priceString = terms[skuOTC].priceDimensions[skuRC].pricePerUnit.USD;
        var price = parseFloat(priceString);
    } else {
        // return price undefined if OnDemand not available
        console.log('\noops:', sku, terms, price);
    }

    return price;
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

