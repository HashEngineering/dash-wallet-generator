"use strict";

var Bitcore = require('bitcore-lib-dash');

var createWallets = function(n, cb) {

    console.log("creating " + n + " paper wallets");

    cb();
};

module.exports = {
    createWallets: createWallets
};
