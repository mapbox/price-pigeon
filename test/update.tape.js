var fs = require('fs');
var tape = require('tape');
var _ = require('underscore');

var update = require('../bin/update.js');

//  all regions are present

// prices are numbers

// every region has at least 10 instance types

// make a very simple fake response fixture

tape.skip('getResponse', function(assert) {
    var method = 'file';
    var address = './fixtures/response.test.json';

    assert.end();
})


    // get a price
tape('getPrice', function(assert) {
    var response = JSON.parse(JSON.stringify(require('./fixtures/response.test.json')));
    var testSKU = 'DQ578CGN99KG6ECF';
    var expectedPrice = 4.931;
    var actualPrice = update.getPrice(response, testSKU);
    assert.equal(typeof(actualPrice), 'number', 'price should be a number');
    assert.equal(actualPrice, expectedPrice, 'getPrice should get the correct price');
    assert.end();
});

    // format a mapping
tape('formatMap', function(assert) {
    var unformattedMap = JSON.parse(JSON.stringify(require('./fixtures/unformattedMap.test.json')));
    var formattedMap = update.formatMap(unformattedMap);
    var emptyObject = {}
    assert.equal(Object.keys(formattedMap).length, 12, 'mapping should have the right number of regions');
    assert.equal(Object.keys(formattedMap['us-west-2']).length, 0, 'mapping shouldn\'t have extra instances');
    assert.equal(formattedMap['ap-south-1']['m4.2xlarge'], 0.743, 'mapping should have correct price');
    assert.end();
})

    // test final output

