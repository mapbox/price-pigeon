#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var output = 'mapping.json';

var priceURL = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';

console.log('requesting price data from AWS...');

// read saved api response during developement
fs.readFile('./apiResponse.json', function (err, buffer) {
    if (err) {
        console.log('err w/file read');
        return;
    } else {
        var response = JSON.parse(buffer);
        parseResponse(response);
    }
});

// // Get API response
// request(priceURL, function (error, response, body) {
//     console.log('got response');
//     if (error) {
//         console.log('Error requesting priceURL:', error);
//     } else {
//         var info = JSON.parse(response.body);
//         parseResponse(info);
//     };
// });

// Parses API response into legible object
module.exports.parseResponse = parseResponse;
function parseResponse(response) {
    var mapping = {};

    // get product details
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
        }
    });

    // get price for each instance object
    _.each(mapping, function(instance) {
        var instanceSKU = instance['sku'];
        var price = getPrice(response, instanceSKU);
        if (price === undefined) {
            // delete listings of instances not available OnDemand
            delete mapping[instanceSKU];
        } else {
            instance['price'] = price;
        };
    });

    var finalMap = formatMap(mapping);

    // write updated map to file
    fs.writeFile('mapping.json', JSON.stringify(finalMap, null, 2), function(err) {
        if (err) return console.log(err);
        console.log('Updated mapping.json');
    });
}

// uses SKU to get price from response. Returns undefined if no terms for OnDemand
module.exports.getPrice = getPrice;
function getPrice(response, sku) {
    var price;
    var terms = response.terms.OnDemand[sku];
    if (terms) {
        // get weird AWS codes
        var skuOTC = Object.keys(terms)[0];
        var skuRC = Object.keys(terms[skuOTC].priceDimensions)[0];

        var priceString = terms[skuOTC].priceDimensions[skuRC].pricePerUnit.USD;
        var price = parseFloat(priceString);
    };
    return price;
}

// Changes region name to correct format, reorders instances by region
module.exports.formatMap = formatMap;
function formatMap(mapping) {

    // base to add instances to
    var map = {
        'us-east-1': {},
        'us-west-1': {},
        'us-west-2': {},
        'us-gov-west-1': {},
        'ap-south-1': {},
        'ap-northeast-2': {},
        'ap-southeast-1': {},
        'ap-southeast-2': {},
        'ap-northeast-1': {},
        'eu-central-1': {},
        'eu-west-1': {},
        'sa-east-1': {}
    };

    // lookup table for different region names
    var regions = {
        'US East (N. Virginia)': 'us-east-1',
        'US West (N. California)': 'us-west-1',
        'US West (Oregon)': 'us-west-2',
        'AWS GovCloud (US)': 'us-gov-west-1',
        'Asia Pacific (Mumbai)': 'ap-south-1',
        'Asia Pacific (Seoul)': 'ap-northeast-2',
        'Asia Pacific (Singapore)': 'ap-southeast-1',
        'Asia Pacific (Sydney)': 'ap-southeast-2',
        'Asia Pacific (Tokyo)': 'ap-northeast-1',
        'EU (Frankfurt)': 'eu-central-1',
        'EU (Ireland)': 'eu-west-1',
        'South America (São Paulo)': 'sa-east-1',
        'South America (Sao Paulo)': 'sa-east-1'
    };

    _.each(mapping, function (instance) {
        var instanceRegion = regions[instance.region];
        map[instanceRegion][instance.instanceType] = instance.price;
    });

    return map;
}


// Notes

            // need: sku, attributes: location, instanceType, operatingSystem
                // check that it has these attrs...
                    // ...because some things don't have operating systems: "productFamily" : "IP Address", "Data Transfer", "Dedicated Host", etc
                // list/dictionary of excluded regions, families, types?

// save results in mapping.json



// function getInfo(response, product) {
//     var region = product.attributes.location;
//     var instanceType = product.attributes.instanceType;
//     var sku = product.sku;

//     var info = {
//         'sku': sku,
//         'region': region,
//         'instanceType': instanceType
//     };
//     return info;
// }

