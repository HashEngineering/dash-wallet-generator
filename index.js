#!/usr/bin/env node

var wallet = require('./lib/wallet.js');
var transaction = require('./lib/transaction.js');
var blockExplorer = require('./lib/blockExplorer.js');
var database = require('./lib/database.js');

var program = require('commander');

program
    .version('0.1.0')
    .option('-c, --create <n>', 'create supplied number of empty wallets', parseInt)
    .option('-l, --list', 'display all created wallets')
    .option('-f, --fund <n>', 'fund created wallets with supplied funding level', parseInt)
    .option('-w, --swept', 'identify wallets that have been swept')
    .option('-p, --spent', 'identify wallets that have been spent')
    .option('-r, --reclaim', 'reclaim funds from paper wallet back to funding wallet')
    .parse(process.argv);

if (program.create) {
    console.log(' creating %j paper wallets', program.create);
    // TODO: validate that int is passed as argument

    wallet.createWallets(program.create, function(err, res) {
        var wallets = res;

        database.add('wallets', wallets, function(err, res) {
            console.log(res);
            console.log("...done!");

            process.exit();

        });
    })
}

if (program.list) {
    console.log(' listing all wallets');

    wallet.listWallets('wallets', {filtered: false}, function(err, res) {
        var wallets = res;

        console.log(wallets);

        console.log("...done!");

        process.exit();
    })
}

if (program.fund) {
    console.log(' funding created wallets');

    // TODO - validate amount provided by user
    var amount = program.fund;

    wallet.listWallets('wallets', {filtered: true}, function(err, res) {
        var wallets = res;

        if (wallets.length > 0) {

            transaction.createFundingTx(amount, wallets, function(err, res) {
                var tx = res.transaction;
                var addresses = res.addresses;

                // Broadcast Funding TX
                blockExplorer.broadcastTx({rawtx: tx.toString()}, function(err, res) {

                    console.log(res);

                    if (res.txid) {

                        // update wallet addresses w/ txid and amount
                        database.edit('wallets', addresses, {txid: tx.id, amount: amount}, function(err, res) {

                            console.log(res);

                            console.log("...done!");

                            process.exit();

                        });

                    } else {

                        console.log("...not done! wait a minute...");

                        process.exit();

                    }

                });

            });

        }

    })
}

if (program.swept) {
    console.log(' checking funded wallets for sweep');

    wallet.listWallets('wallets', {filtered: false}, function(err, res) {
        var wallets = res;

        for (i=0; i<res.length; i++) {

            // console.log(res[i].address);
            transaction.sweptAddrQueue.push(res[i]);

        }

        console.log("...done!");
    })
}

if (program.spent) {
    console.log(' checking swept wallets for spend');

    wallet.listWallets('swept', {filtered: false}, function(err, res) {
        var wallets = res;

        for (i=0; i<res.length; i++) {

            // console.log(res[i].address);
            transaction.spentAddrQueue.push(res[i]);

        }

        console.log("...done!");
    })
}
