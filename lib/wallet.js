"use strict";

var Bitcore = require('bitcore-lib-dash');
Bitcore.Networks.defaultNetwork = Bitcore.Networks.testnet;

var database = require('./database.js');

var createWallets = function(n, cb) {

    var wallets = [];

    for (var i = 0; i < n; i++) {
        var privateKey = new Bitcore.PrivateKey();
        var wif = privateKey.toWIF();
        var address = privateKey.toAddress();

        wallets.push({address: address, wif: wif, txid: "", amount: ""});
    }

    cb(null, wallets);

};

var listWallets = function(opts, cb) {

    var filtered = opts.filtered; // if true, only display non-funded wallets
    var query = {};

    if (filtered) query.txid = "";

    database.get(query, function(err, res) {
        cb(null, res);
    })

};

// TODO: deleteWallet -- delete wallet from CSV database

module.exports = {
    createWallets: createWallets,
    listWallets: listWallets
};
