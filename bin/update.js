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


console.log('requesting...');

// read save api response to save time during developement
fs.readFile('./apiResponse.json', function (err, buffer) {
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
                // if (!mapping[region]) {
                //     mapping[region] = {};
                // }
                // mapping[region][instanceType] = {'sku': sku};
        }
    });

    // get price for each instance object
    _.each(mapping, function(instance) {
        var instanceSKU = instance['sku'];
        var price = getPrice(response, instanceSKU);
        instance['price'] = price;
    });

    // var testPrice = getPrice(response, '4APTB9YMQM9QTQK3');
    // console.log('testPrice:', JSON.stringify(testPrice, null, 2));

    var finalMap = formatMap(mapping);

    console.log('finalMap:', finalMap);
    return finalMap;
}

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
        console.log('not OnDemand:', sku, terms, price);
    };

    return price;
}


    // current:
    // YJ2E4JTYGN2FMNQM: {
    //     sku: 'YJ2E4JTYGN2FMNQM',
    //     region: 'Asia Pacific (Tokyo)',
    //     instanceType: 'cc2.8xlarge',
    //     price: 2.349
    // },

    // desired:
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


function formatMap(mapping) {
    // takes in flat json, turns into neatly nested map
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
        console.log('old region:', instance.region);
        console.log('new region:', instanceRegion);
        // console.log(instance);
        map[instanceRegion][instance.instanceType] = instance.price;
    });

    return map;
}


            // need: sku, attributes: location, instanceType, operatingSystem
                // check that it has these attrs...
                    // ...because some things don't have operating systems: "productFamily" : "IP Address", "Data Transfer", "Dedicated Host", etc
                // list/dictionary of excluded regions, families, types?

// save results in mapping.json



