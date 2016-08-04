#!/usr/bin/env node

var _ = require('underscore');
var fs = require('fs');
var lib = require('../lib/lib.js');

var output = 'priceMap.json';

module.exports.priceMap = priceMap;
function priceMap(percent) {
    var originalMapping = JSON.parse(output);
    var calculatedMapping = calculatePrice(originalMapping, percent);
    fs.writeFileSync(output, JSON.stringify(calculatedMapping, null, 2));
};
