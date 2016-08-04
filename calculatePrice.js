#!/usr/bin/env node

var _ = require('underscore');
var lib = require('./lib/lib.js');

var input = './priceMap.json';

module.exports.priceMap = priceMap;
function priceMap(percent) {
    var originalMapping = JSON.parse(JSON.stringify(require(input)));
    var calculatedMapping = lib.calculatePrice(originalMapping, percent);
    return calculatedMapping;
};