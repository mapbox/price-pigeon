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
    var fullRatio = 1;
    var halfRatio = 0.5;
    var actualFullMap = lib.calculatePrice(originalMap, fullRatio);
    assert.equal(actualFullMap, originalMap, 'calculatePrice keeps original map for full price maps');

    var actualHalfMap = lib.calculatePrice(originalMap, halfRatio);
    assert.deepEqual(actualHalfMap, expectedHalfMap, 'calculatePrice changes prices correctly');
    assert.end();
});
