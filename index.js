#!/usr/bin/env node

var wallet = require('./lib/wallet.js');

var program = require('commander');

program
    .version('0.1.0')
    .option('-c, --create <n>', 'create supplied number of empty wallets', parseInt)
    .option('-l, --list', 'display all created wallets')
    .parse(process.argv);

if (program.create) {
    console.log(' int: %j', program.create);

    // TODO: validate that int is passed as argument

    wallet.createWallets(program.create, function() {
        console.log("...done!");
    })
}

if (program.list) console.log(' list');


