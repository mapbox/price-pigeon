#!/usr/bin/env node

var _ = require('underscore');
var fs = require('fs');
var request = require('request');


// TODO: ditch 'file' input method, spoof api call instead
// Make API call or read from file
module.exports.getResponse = getResponse;
function getResponse(method, address, callback) {
    var response;
    method = method || 'url';
    address = address || 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';

    // comment in to use saved api response for developement
    // method = 'file';
    // address =  './apiResponse.json';

    if (method === 'url') {
        // Get API response
        request(address, function(err, response, body) {
            if (err) {
                throw new Error('bad request');
            } else {
                response = response.body;
                return callback(null, response);
            };
        });
    } else if (method === 'file') {
        // read saved api response from file
        fs.readFile(address, 'utf-8', function(err, buffer) {
            if (err) {
                throw new Error('bad request');
            } else {
                response = buffer;
                return callback(null, response);
            };
        });
    };
};


// main function; takes api response and writes mapping to file
module.exports.createMapping = createMapping;
function createMapping(response) {
    var parsedResponse = parseResponse(response);
    var mapping = formatMap(parsedResponse);

    return mapping;
};


// Parses API response into legible object
module.exports.parseResponse = parseResponse;
function parseResponse(response) {
    var info = JSON.parse(response);
    var mapping = {};
    var ourRegions = {
        'US East (N. Virginia)': 'us-east-1',
        'US West (N. California)': 'us-west-1',
        'US West (Oregon)': 'us-west-2',
        'Asia Pacific (Sydney)': 'ap-southeast-2',
        'EU (Ireland)': 'eu-west-1',
    };

    // get product details
    _.each(info.products, function(product) {
        // only get Linux products for now
        if (product.productFamily === 'Compute Instance' && product.attributes.operatingSystem === 'Linux') {
            var region = product.attributes.location;
            if (region in ourRegions) {
                var instanceType = product.attributes.instanceType;
                var sku = product.sku;
                mapping[sku] = {
                    'sku': sku,
                    'instanceType': instanceType
                };
            };
        }
    });

    // get price for each instance object
    _.each(mapping, function(instance) {
        var instanceSKU = instance['sku'];
        var price = getPrice(info, instanceSKU);
        if (price === undefined) {
            // delete listings of instances not available OnDemand
            delete mapping[instanceSKU];
        } else {
            instance['price'] = price;
        };
    });

    return mapping;
}


// uses SKU to get price from response. Returns undefined if no terms for OnDemand
module.exports.getPrice = getPrice;
function getPrice(info, sku) {
    var price;
    var terms = info.terms.OnDemand[sku];
    if (terms) {
        // get weird AWS codes
        var skuOTC = Object.keys(terms)[0];
        var skuRC = Object.keys(terms[skuOTC].priceDimensions)[0];

        var priceString = terms[skuOTC].priceDimensions[skuRC].pricePerUnit.USD;
        var price = parseFloat(priceString);
    };
    return price;
}


// Adds highest price to mapping in correct format
module.exports.formatMap = formatMap;
function formatMap(parsedResponse) {
    var mapping = {};

    _.each(parsedResponse, function(instance) {
        if (instance.price) {
            if (!mapping[instance.instanceType]) {
                mapping[instance.instanceType] = {'price': instance.price};
                // console.log('new:', instance.instanceType);
            } else if (mapping[instance.instanceType]['price'] < instance.price) {
                // console.log(mapping[instance.instanceType]["price"], 'updated to: ', instance.price);
                mapping[instance.instanceType]['price'] = instance.price;
            };
        }
    });

    return mapping;
}
