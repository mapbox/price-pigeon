#!/usr/bin/env node

var fs = require('fs');
var lib = require('../lib/lib.js');

var output = 'priceMap.json';

if (!module.parent) {
    runUpdate();
}

function runUpdate() {
    lib.getResponse(null, null, function(err, response) {
        var mapping = lib.createMapping(response, output);
        fs.writeFileSync(output, JSON.stringify(mapping, null, 2));
    });
}
