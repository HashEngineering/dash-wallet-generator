"use strict";

var request = require('request');
var config = require('./config.js').config;
var blockExplorer = require('./blockExplorer.js');

var Bitcore = require('bitcore-lib-dash');

if (config.network === 'testnet') {
    Bitcore.Networks.defaultNetwork = Bitcore.Networks.testnet;
}

var wallet = config.wallet;
var privateKey = Bitcore.PrivateKey.fromWIF(wallet.wif);

var createFundingTx = function(amount, wallets, cb) {

    var result = {
        transaction: null,
        addresses: []
    };

    blockExplorer.getUtxo(wallet.address, function (err, res) {

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

module.exports = {
    createFundingTx: createFundingTx
};
