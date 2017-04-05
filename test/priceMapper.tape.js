var _ = require('underscore');
var fs = require('fs');
var lib = require('../lib/lib.js');
var priceMapper = require('../priceMapper.js').priceMapper;
var tape = require('tape');

tape('priceMapper', function(assert) {
    var ratio = 0.25;
    var fullPrice = 0.064;

    var ratioPriceMap = priceMapper(ratio);
    var ratioPrice = ratioPriceMap['t2.medium']['price'];
    assert.equal(ratioPrice, (fullPrice * ratio), 'PriceMapper completes the price change');

    var fullPriceMap = priceMapper();
    var actualFullPrice = fullPriceMap['t2.medium']['price'];
    assert.equal(actualFullPrice, fullPrice, 'PriceMapper ratio parameter defaults to 1');

    assert.end();
});

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

    var noRatioMap = lib.calculatePrice(originalMap);
    assert.equal(noRatioMap, originalMap, 'calculatePrice keeps original map when no ratio is provided');

    var actualHalfMap = lib.calculatePrice(originalMap, halfRatio);
    assert.deepEqual(actualHalfMap, expectedHalfMap, 'calculatePrice changes prices correctly');

    assert.end();
});
