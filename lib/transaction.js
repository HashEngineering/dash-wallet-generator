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
var privateKey = Bitcore.PrivateKey.fromString(wallet.privateKey);

var createReclaimTx = function(wallets, address, cb) {

    for (var i = 0; i < wallets.length; i++) {

        var wif = wallets[i].wif;

        var txid = wallets[i].txid;
        var address = wallets[i].address;
        var amount = parseInt(wallets[i].amount - 5430);
        var utxo = JSON.parse(wallets[i].utxo);

        var transaction = new Bitcore.Transaction()
            .to(wallet.address, amount)
            .from(utxo)
            .fee(5430)
            .change(address);

        var privKey = Bitcore.PrivateKey.fromWIF(wif);

        transaction.sign(privKey);

        database.edit('wallets', [address], {txid: null, amount: 0, utxo: null}, function(err, res) {

            console.log(res);

            console.log("...reclaimed!");

        });

        // TODO - create broadcast queue?

        // Broadcast Funding TX
        blockExplorer.broadcastTx({rawtx: transaction.toString()}, function(err, res) {

            console.log(res);

            if (res.txid) {

                console.log(address);

            } else {

                console.log("...not done! wait a minute...");

            }

        });

    }

    cb(null, transaction);

};

var createFundingTx = function(amount, wallets, cb) {

    var maxTx = config.maxTx;

    var result = {
        transaction: null,
        addresses: []
    };

    blockExplorer.getUtxo(wallet.address, function (err, res) {

        console.log(res);

        // TODO - fail gracefully if funds not available

        var unspentFunds = 0;
        var utxo = {};

        for (var i = 0; i < res.length; i++) {

            // identify largest utxo
            if (res[i].satoshis > unspentFunds) {
                unspentFunds = res[i].satoshis;
                utxo = res[i];
            }

        }

        // determine maximum number of fundable wallets
        var maxFundableWallets = Math.floor(utxo.satoshis / amount); // e.g. 288

        if (maxFundableWallets > maxTx) {
            maxFundableWallets = maxTx;
        }

        // determine if we can fund all provided wallets, if not trim to max number of wallets
        var n = wallets.length; // total number of wallet array addresses
        if (n > maxFundableWallets) n = maxFundableWallets - 1;

        console.log(utxo);

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


var scanFundedUtxo = function(data, done) {

    var addr = data.address;
    var txid = data.txid;
    var amount = data.amount;

    console.log("> fetching address " + addr);

    setTimeout(
        function(addr) {
            blockExplorer.getUtxo(addr, function(err, res) {

                if (typeof res !== 'undefined' && res) {

                    if (res.length == 1) {

                        var address = res[0].address;
                        var amount = res[0].satoshis;
                        var txid = res[0].txid;

                        database.edit('wallets', [address], {txid: txid, amount: amount, utxo: JSON.stringify(res)}, function(err, res) {

                            console.log(res);

                            console.log("...done!");

                        });

                    }

                }
                done();
            });
        }.bind(null, addr), Math.floor((Math.random() * 2000) + 1000));
};

var scanUtxoQueue = async.queue(scanFundedUtxo, 10);
scanUtxoQueue.drain = function() {

    console.log("done!");

};



var scanSweptAddr = function(data, done) {

    var addr = data.address;
    var txid = data.txid;
    var amount = data.amount;

    console.log("> fetching address " + addr);

    setTimeout(
        function(txid) {
            blockExplorer.getAddress(addr, function(err, res) {
                if (typeof res !== 'undefined' && typeof res.transactions !== 'undefined' && res) {

                    // If transactions[] is greater than one we assume that funds have been swept
                    if (res.transactions.length > 1) {

                        for (var i=0; i<res.transactions.length; i++) {

                            console.log(txid);

                            if (res.transactions[i] !== txid) { // ignore the initial funding tx

                                var new_txid = res.transactions[i]; // swept txid

                                blockExplorer.getTx(res.transactions[i], function (err, response) {

                                    var new_addr = response.vout[0].scriptPubKey.addresses[0]; // swept address
                                    var new_amount = response.vout[0].value * 100000000; // swept satoshis

                                    // write to new csv
                                    database.add('swept', [{funded_address: addr, swept_address: new_addr, txid: new_txid, amount: new_amount}], function(err, res) {
                                        console.log('> funds swept from ' + addr + ' to ' + new_addr);
                                    });

                                    // delete from old csv
                                    database.del('wallets', {address: addr}, function(err, res) {

                                    });

                                })

                            }

                        }

                    }

                }
                done();
            });
        }.bind(null, txid), Math.floor((Math.random() * 2000) + 1000));
};

var sweptAddrQueue = async.queue(scanSweptAddr, 10);
sweptAddrQueue.drain = function() {

    console.log("done!");

};

var scanSpentAddr = function(data, done) {

    var funded_addr = data.funded_address;
    var addr = data.swept_address;
    var txid = data.txid;
    var amount = data.amount;

    console.log("> fetching address " + addr);

    setTimeout(
        function(txid) {
            blockExplorer.getUtxo(addr, function(err, res) {
                if (typeof res !== 'undefined' && res) {

                    var utxoSpent = true; // assume utxo has been spent
                    var newTxId = '';

                    for (var i=0; i<res.length; i++) {

                        if (res[i].txid === txid) {
                            utxoSpent = false; // utxo found -- it has not been spent
                        }

                    }

                    if (utxoSpent) {

                        console.log("Fetching Address:", addr);

                        // Identify the TXID used and when
                        blockExplorer.getAddress(addr, function(err, res) {

                            console.log("GetAddress Response:",res);

                            for (var i=0; i<res.transactions.length; i++) {

                                console.log(txid);

                                if (res.transactions[i] !== txid) { // ignore the sweep tx

                                    var new_txid = res.transactions[i]; // swept txid

                                    blockExplorer.getTx(res.transactions[i], function (error, response) {

                                        if (typeof response !== 'undefined' && response) {

                                            console.log(response);

                                            var new_addr = response.vout[0].scriptPubKey.addresses[0]; // swept address
                                            var new_amount = response.vout[0].value * 100000000; // swept satoshis

                                            // write to new csv
                                            database.add('spent', [{funded_address: funded_addr, spent_address: new_addr, txid: new_txid, amount: new_amount}], function(err, res) {
                                                console.log('> funds swept from ' + addr + ' to ' + new_addr);
                                            });

                                        }

                                    })

                                }

                            }

                        });

                    }

                }
                done();
            });
        }.bind(null, txid), Math.floor((Math.random() * 2000) + 1000));
};

var spentAddrQueue = async.queue(scanSpentAddr, 10);
spentAddrQueue.drain = function() {

    console.log("done!");

};


var scanFundedAddr = function(data, done) {

    var addr = data.address;

    console.log("> fetching address " + addr);

    setTimeout(
        function() {
            blockExplorer.getAddress(addr, function(err, res) {

                if (typeof res !== 'undefined' && res && res !== 'Invalid address: Checksum mismatch. Code:1') {

                    var txAppearances = parseInt(res.txApperances - 1);
                    var txid = res.transactions[txAppearances];
                    var amount = res.totalReceivedSat;

                    // update database with txid and amount

                    console.log(txid);
                    console.log(amount);

                    // assumption -- only one funding TXID
                    database.edit('wallets', [addr], {txid: txid, amount: amount}, function(err, res) {

                        // console.log(res);

                        console.log("...done!");


                    });

                }

                done();
            });
        }, Math.floor((Math.random() * 2000) + 1000));
};

var fundedAddrQueue = async.queue(scanFundedAddr, 100);
fundedAddrQueue.drain = function() {

    console.log("done!");

    process.exit();

};

module.exports = {
    createFundingTx: createFundingTx,
    fundedAddrQueue: fundedAddrQueue,
    sweptAddrQueue: sweptAddrQueue,
    spentAddrQueue: spentAddrQueue,
    scanUtxoQueue: scanUtxoQueue,
    scanSweptAddr: scanSweptAddr,
    createReclaimTx: createReclaimTx
};
