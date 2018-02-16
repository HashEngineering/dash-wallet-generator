#!/usr/bin/env node

var wallet = require('./lib/wallet.js');
var transaction = require('./lib/transaction.js');

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

    wallet.createWallets(program.create, function() {
        console.log("...done!");
    })
}

if (program.list) {
    console.log(' listing all wallets');

    wallet.listWallets({funded: false}, function() {
        console.log("...done!");
    })
}

if (program.fund) {
    console.log(' funding created wallets');

    // TODO - validate amount provided by user
    var amount = program.fund;

    wallet.listWallets({funded: false}, function(err, res) {

        var wallets = res;

        transaction.createFundingTx(amount, wallets, function(err, res) {

            console.log(res.transaction.toString());

            // Broadcast Funding TX
            /*
            transaction.broadcastTx({rawtx: res.transaction.toString()}, function(err, res) {
                console.log(res);
            });
            */

            // TODO - update wallet CSV db

        });

    })
}
