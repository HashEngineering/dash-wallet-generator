"use strict";

var request = require('request');
var config = require('./config.js').config;

var urlr; // API Root URL

if (config.network === 'mainnet') {
    urlr = config.insight_api + config.api_prefix;
} else {
    urlr = config.insight_api_testnet + config.api_prefix;
}

var getTx = function(hash, cb) {
    _get('/tx/' + hash, function(error, body) {
        cb(error, body);
    });
};

var getAddress = function(addr, cb) {
    _get('/addr/' + addr, function(error, body) {
        cb(error, body);
    });
};

var getBlockIndex = function(height, cb) {
    _get('/block-index/' + height, function(error, body) {
        cb(error, body);
    });
};

var getBlock = function(hash, cb) {
    _get('/block/' + hash, function(error, body) {
        cb(error, body);
    });
};

var getLastBlock = function(cb) {
    _get('/status?q=getLastBlockHash', function(error, body) {
        cb(error, body);
    });
};

var getUtxo = function(address, cb) {
    _get('/addr/' + address + "/utxo", function(error, body) {
        cb(error, body);
    });
};

var broadcastTx = function(tx, cb) {
    _post('/tx/send', tx, function(error, body) {
        cb(error, body);
    });
};

var _get = function(url, cb) {
    var requestUrl = urlr + url;
    request.get({
        url:requestUrl,
        strictSSL:false,
        json: true
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            cb(error, body || {});
        } else {
            cb(null, body);
        }
    });
};

var _post = function(url, data, cb) {
    var requestUrl = urlr + url;
    request.post({
        url:requestUrl,
        strictSSL:false,
        json: true,
        body: data
    }, function (error, response, body) {
        if (error || (response.statusCode !== 200 && response.statusCode !== 201)) {
            cb(error, body || {});
        } else {
            cb(null, body);
        }
    });
};

module.exports = {
    getTx: getTx,
    getAddress: getAddress,
    getBlock: getBlock,
    getBlockIndex: getBlockIndex,
    getLastBlock: getLastBlock,
    getUtxo: getUtxo,
    broadcastTx: broadcastTx
};
