#!/usr/bin/env node

var wallet = require('./lib/wallet.js');
var transaction = require('./lib/transaction.js');
var database = require('./lib/database.js');

var program = require('commander');

program
    .version('0.1.0')
    .option('-c, --create <n>', 'create supplied number of empty wallets', parseInt)
    .option('-l, --list', 'display all created wallets')
    .option('-f, --fund <n>', 'fund created wallets with supplied funding level', parseInt)
    .parse(process.argv);

if (program.create) {
    console.log(' creating %j paper wallets', program.create);
    // TODO: validate that int is passed as argument

    wallet.createWallets(program.create, function(err, res) {
        var wallets = res;

        database.add(wallets, function(err, res) {
            console.log(res);
            console.log("...done!");
        });
    })
}

if (program.list) {
    console.log(' listing all wallets');

    wallet.listWallets({filtered: false}, function(err, res) {
        var wallets = res;

        console.log(wallets);
        console.log("...done!");
    })
}

if (program.fund) {
    console.log(' funding created wallets');

    // TODO - validate amount provided by user
    var amount = program.fund;

    wallet.listWallets({filtered: true}, function(err, res) {
        var wallets = res;

        if (wallets.length > 0) {

            transaction.createFundingTx(amount, wallets, function(err, res) {
                var tx = res.transaction;
                var addresses = res.addresses;

                // Broadcast Funding TX
                transaction.broadcastTx({rawtx: tx.toString()}, function(err, res) {
                    console.log(res);
                });

                // update wallet addresses w/ txid and amount
                for (var i = 0; i < addresses.length; i++) {
                    database.edit({address: addresses[i]}, {txid: tx.id, amount: amount}, function(err, res) {
                        console.log(res);
                    });
                }

            });

        }

    })
}
