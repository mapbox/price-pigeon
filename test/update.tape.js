var _ = require('underscore');
var fs = require('fs');
var tape = require('tape');
var lib = require('../lib/lib.js');

tape('getResponse', function(assert) {
    var method = 'file';
    var address = './apiResponse.json';

    lib.getResponse(method, address, function(err, res) {
        if (res) {
            var info = JSON.parse(res);
            var actualVersion = info['formatVersion'];
            var expectedVersion = 'v1.0';
        };
        assert.equal(actualVersion, expectedVersion, 'getResponse succeeds with good file input');
    });
    lib.getResponse(null, null, function(err, res) {
        if (res) {
            var info = JSON.parse(res);
            var actualVersion = info['formatVersion'];
            var expectedVersion = 'v1.0';
        };
        assert.equal(actualVersion, expectedVersion, 'getResponse gets API response with correct version');
    });
    assert.end();
});

// update mapping.json
tape('createMapping', function(assert) {
    var response = JSON.stringify(require('./fixtures/response.test.json'));
    var result = lib.createMapping(response);
    var expected = JSON.parse(JSON.stringify(require('./fixtures/mapping.test.json')));
    assert.deepEqual(result, expected, 'createMapping should map an API response');
    assert.end();
});

// get a price
tape('getPrice', function(assert) {
    var response = JSON.parse(JSON.stringify(require('./fixtures/response.test.json')));
    var testSKU = 'A67CJDV9B3YBP6N6';
    var expectedPrice = 2.6;
    var actualPrice = lib.getPrice(response, testSKU);
    assert.equal(typeof(actualPrice), 'number', 'getPrice should return a number');
    assert.equal(actualPrice, expectedPrice, 'getPrice should get the correct price');
    assert.end();
});

// format a mapping
tape('formatMap', function(assert) {
    var unformattedMap = JSON.parse(JSON.stringify(require('./fixtures/unformattedMap.test.json')));
    var formattedMap = lib.formatMap(unformattedMap);
    var price = 2.6;

    assert.equal(Object.keys(formattedMap).length, 3, 'mapping shouldn\'t have extra instances');
    assert.equal(formattedMap['g2.8xlarge']['price'], price, 'mapping should have correct price');
    assert.end();
});
