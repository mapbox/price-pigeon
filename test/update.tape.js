var _ = require('underscore');
var fs = require('fs');
var tape = require('tape');

var update = require('../bin/update.js');
var lib = require('../lib/lib.js');

// // make a mapping from file input
// tape('getResponse succeeds', function(assert) {
//     var method = 'file';
//     var address = './apiResponse.json';

//     update.getResponse(method, address, function(err, res) {
//         if (res) var resSuccess = res.includes('Success');
//         assert.equal(resSuccess, true, 'getResponse succeeds with good file input');
//         assert.end();
//     });
// });

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
    var testSKU = 'DQ578CGN99KG6ECF';
    var expectedPrice = 4.931;
    var actualPrice = lib.getPrice(response, testSKU);
    assert.equal(typeof(actualPrice), 'number', 'price should be a number');
    assert.equal(actualPrice, expectedPrice, 'getPrice should get the correct price');
    assert.end();
});

// format a mapping
tape('formatMap', function(assert) {
    var unformattedMap = JSON.parse(JSON.stringify(require('./fixtures/unformattedMap.test.json')));
    var formattedMap = lib.formatMap(unformattedMap);
    var regions = JSON.parse(JSON.stringify(require('./fixtures/regions.test.json')))
    var price = 0.743;

    assert.equal(Object.keys(formattedMap).length, regions.length, 'mapping should have the right number of regions');
    assert.equal(Object.keys(formattedMap['us-west-2']).length, 0, 'mapping shouldn\'t have extra instances');
    assert.equal(formattedMap['ap-south-1']['m4.2xlarge'], price, 'mapping should have correct price');
    assert.end();
});
