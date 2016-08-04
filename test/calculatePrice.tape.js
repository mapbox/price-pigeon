var _ = require('underscore');
var fs = require('fs');
var lib = require('../lib/lib.js');
var tape = require('tape');

tape('calculatePrice', function(assert) {
    var originalMap = {'apple': {'price': 10},
                        'm3.large': {'price': 0.35}
                      };
    var expectedHalfMap = {'apple': {'price': 5},
                        'm3.large': {'price': 0.175}
                      };
    var fullPercent = 1;
    var halfPercent = 0.5;
    var actualFullMap = lib.calculatePrice(originalMap, fullPercent);
    assert.equal(actualFullMap, originalMap, 'calculatePrice keeps original map for 100% prices');

    var actualHalfMap = lib.calculatePrice(originalMap, halfPercent);
    assert.deepEqual(actualHalfMap, expectedHalfMap, 'calculatePrice changes prices correctly');
    assert.end();
});