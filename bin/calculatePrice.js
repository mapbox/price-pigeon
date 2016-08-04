#!/usr/bin/env node

var _ = require('underscore');
var fs = require('fs');
var lib = require('../lib/lib.js');

var output = 'priceMap.json';

// takes in mapping, modifies prices if percent !=1
function calculatePrice(output, percent) {
    if (percent === 1) {
        return output;
    };

    _.each(output, function(instance, percent) {
        instance["price"] = instance["price"] * percent;
    });

}

module.exports.priceMap = priceMap;
function priceMap(percent) {
    // output into json
    // pass to calculatePrice w/ percent
    // writes to file
}
