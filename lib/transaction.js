"use strict";

var request = require('request');

var Bitcore = require('bitcore-lib-dash');
Bitcore.Networks.defaultNetwork = Bitcore.Networks.testnet;

const INSIGHT_API = 'https://insight.dashevo.org/insight-api-dash/';
const INSIGHT_API_TESTNET = 'http://testnet-insight.dashevo.org/insight-api-dash/';

/* Funded Testnet Wallet */
var wallet = {
    address: "yXhjjVKb7u67kXLMjUjUwLaNHjJFkoJqdJ",
    wif: "cTwTJX2bGERxymwoB5Lmzg1kfywR56iaaxNtncRPjRq1zqoqk94X"
};
var privateKey = Bitcore.PrivateKey.fromWIF(wallet.wif);



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

var createFundingTx = function(amount, wallets, cb) {

    var result = {
        transaction: null,
        addresses: []
    };

    getUtxo(wallet.address, function (err, res) {

        // TODO - fail gracefully if funds not available

        var utxo = res[0]; // TODO - handle multiple utxo?

        // determine maximum number of fundable wallets
        var maxFundableWallets = Math.floor(utxo.satoshis / amount); // e.g. 288

        // determine if we can fund all provided wallets, if not trim to max number of wallets
        var n = wallets.length; // total number of wallet array addresses
        if (n > maxFundableWallets) n = maxFundableWallets - 1;

        // create funding tx for wallets
        var transaction = new Bitcore.Transaction()
            .from(utxo)
            .change(wallet.address);

        // add outputs
        for (var i = 0; i < n; i++) {
            transaction.to(wallets[i].address, amount);
            result.addresses.push(wallets[i].address); // add funded address to stack
        }

        transaction.sign(privateKey);

        result.transaction = transaction;

        cb(null, result);

    });

};


// TODO: reclaimFunds -- reclaim funds using WIF

var _get = function(url, cb) {
    var urlr = INSIGHT_API_TESTNET + url;
    request.get({
        url:urlr,
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
    var urlr = INSIGHT_API_TESTNET + url;
    request.post({
        url:urlr,
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
    createFundingTx: createFundingTx,
    broadcastTx: broadcastTx
};
