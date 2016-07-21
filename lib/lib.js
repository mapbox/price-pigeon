#!/usr/bin/env node

var _ = require('underscore');
var fs = require('fs');
var request = require('request');


// Make API call or read from file
/**
 * Handle parsing and formatting of the API response or file
 *
 * @param {string} method - can be 'url' or 'file'
 * @param {string} address - a url or filepath
 * @param {function} callback
 */
module.exports.getResponse = getResponse;
function getResponse(method, address, callback) {
    var response;
    method = method || 'url';
    address = address || 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';

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


/**
 * Handle parsing and formatting of the API response or file
 *
 * @param {string} response - body of the API response object or file
 * @returns mapping - a map of prices by instance type
 */
module.exports.createMapping = createMapping;
function createMapping(response) {
    var parsedResponse = parseResponse(response);
    var mapping = formatMap(parsedResponse);

    return mapping;
};


/**
 * Parses API response into legible object. Only keeps Linux
 * Compute Instances.
 *
 * @param {JSON} response - body of the API response object or file
 * @returns mapping - object containing an object for each sku,
 * with `sku`, `instanceType`, and `price` properties.
 */
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


/**
 * Gets the price of the product from the response
 *
 * @param {JSON} info - body of the API response object or file
 * @param {string} sku - sku of the price needed
 * @returns price - float of the price. Undefined if that product
 * isn't offered on OnDemand
 */
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


/**
 * Adds highest price for that instance type to mapping in correct format
 *
 * @param {JSON} parsedResponse - object containing an object for each sku,
 * with `sku`, `instanceType`, and `price` properties.
 * @returns mapping - JSON map of each instanct type and its price
 */
module.exports.formatMap = formatMap;
function formatMap(parsedResponse) {
    var mapping = {};

    _.each(parsedResponse, function(instance) {
        if (instance.price) {
            if (!mapping[instance.instanceType]) {
                mapping[instance.instanceType] = {'price': instance.price};
            } else if (mapping[instance.instanceType]['price'] < instance.price) {
                mapping[instance.instanceType]['price'] = instance.price;
            };
        }
    });

    return mapping;
}
