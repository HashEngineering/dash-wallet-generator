"use strict";

var config = require('./config.js').config;

var Bitcore = require('bitcore-lib-dash');

if (config.network === 'testnet') {
    Bitcore.Networks.defaultNetwork = Bitcore.Networks.testnet;
}

var database = require('./database.js');

var createWallets = function(n, cb) {

    var wallets = [];

    for (var i = 0; i < n; i++) {
        var privateKey = new Bitcore.PrivateKey();
        var wif = privateKey.toWIF();
        var address = privateKey.toAddress();

        wallets.push({address: address, wif: wif, txid: "", amount: 0});
    }

    cb(null, wallets);

};

var listWallets = function(table, opts, cb) {

    database.get(table, opts, function(err, res) {

        if (err) cb(err, null);

        cb(null, res);

    })

};

// TODO: deleteWallet -- delete wallet from CSV database

module.exports = {
    createWallets: createWallets,
    listWallets: listWallets
};
