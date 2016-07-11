#!/usr/bin/env node

var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var lib = require('../lib/lib.js');

var output = 'mapping.json';

if (!module.parent) {
    getResponse(null, null, function(err, res) {
        if (err) throw err;
        if (res) console.log(res);
    });
}

// TODO: ditch 'file' input method, spoof api call instead
// Make API call or read from file
module.exports.getResponse = getResponse;
function getResponse(method, address, callback) {
    var response;
    method = method || 'url';
    address = address || 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json';

    // // comment in to use saved api response for developement
    method = 'file';
    address =  './apiResponse.json';

    // try/catchify?
    if (method === 'url') {
        // Get API response
        request(address, function(err, response, body) {
            if (err) {
                return callback(err);
            } else {
                response = response.body;
                createMapping(response, output, callback);
            };
        });
    } else if (method === 'file') {
        // read saved api response from file
        fs.readFile(address, function(err, buffer) {
            if (err) {
                return callback(err);
            } else {
                response = buffer;
                createMapping(response, output, callback);
            };
        });
    };
};

// main function; takes api response and writes mapping to file
module.exports.createMapping = createMapping;
function createMapping(response, output, callback) {
    var parsedResponse = lib.parseResponse(response);
    var mapping = lib.formatMap(parsedResponse);

    fs.writeFileSync(output, JSON.stringify(mapping, null, 2));
    return callback(null, 'Success - updated ' + output + '!');
};


