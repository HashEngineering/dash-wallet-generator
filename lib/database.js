"use strict";

var async = require("async");
var await = require("await");
var csvdb = require('csv-database');

async function add(data, cb) {
    const db = await csvdb("wallets.csv", ["address","wif","txid","amount"]);
    var result = await db.add(data);

    cb(null, result);
}

async function get(query, cb) {
    const db = await csvdb("wallets.csv", ["address","wif","txid","amount"]);
    var result = await db.get(query);

    cb(null, result);
}

async function edit(query, data, cb) {
    const db = await csvdb("wallets.csv", ["address","wif","txid","amount"]);
    var result = await db.edit(query, data);

    cb(null, result);
}

module.exports = {
    add: add,
    get: get,
    edit: edit
};
