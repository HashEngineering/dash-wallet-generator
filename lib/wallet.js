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

    database.add(wallets, function(err, res) {
        console.log(res);
        cb();
    });

};

var listWallets = function(opts, cb) {

    var funded = opts.funded || 'false'; // only display non-funded wallets

    database.get({txid: ""}, function(err, res) {
        // console.log(res);
        cb(null, res);
    })

};

// TODO: deleteWallet -- delete wallet from CSV database

// TODO: updateWallet -- record txid and amount

module.exports = {
    createWallets: createWallets,
    listWallets: listWallets
};
