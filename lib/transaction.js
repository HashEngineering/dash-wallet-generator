"use strict";

var request = require('request');
var async = require('async');

var config = require('./config.js').config;
var blockExplorer = require('./blockExplorer.js');
var database = require('./database.js');

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

var scanSweptAddr = function(data, done) {

    var addr = data.address;
    var txid = data.txid;
    var amount = data.amount;

    console.log("> fetching address " + addr);

    setTimeout(
        function() {
            blockExplorer.getAddress(addr, function(err, res) {
                if (typeof res !== 'undefined' && res) {

                    // If transactions[] is greater than one we assume that funds have been swept
                    if (res.transactions.length > 0) {

                        for (var i=0; i<res.transactions.length; i++) {

                            if (res.transactions[i] !== txid) { // ignore the initial funding tx

                                var new_txid = res.transactions[i]; // swept txid

                                blockExplorer.getTx(res.transactions[i], function (err, response) {

                                    var new_addr = response.vout[0].scriptPubKey.addresses[0]; // swept address
                                    var new_amount = response.vout[0].value * 100000000; // swept satoshis

                                    // write to new csv
                                    database.add('swept', {funded_address: addr, swept_address: new_addr, txid: new_txid, amount: new_amount}, function(err, res) {
                                        console.log(res);
                                    });

                                    // delete from old csv
                                    database.del('wallets', {address: addr}, function(err, res) {
                                        console.log(res);
                                    });

                                })

                            }

                        }

                    }

                }
                done();
            });
        }, Math.floor((Math.random() * 2000) + 1000));
};

var sweptAddrQueue = async.queue(scanSweptAddr, 5);
sweptAddrQueue.drain = function() {

    console.log("done!");

};

module.exports = {
    createFundingTx: createFundingTx,
    sweptAddrQueue: sweptAddrQueue
};
