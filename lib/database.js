"use strict";

var async = require("async");
var await = require("await");
var csvdb = require('csv-database');
var config = require('./config.js').config;

var mysql = require('mysql');
var util = require('util');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

pool.query = util.promisify(pool.query);

pool.getConnection(function(err, connection) {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release();

    return;
});

async function add(table, data, cb) {

    var query = "INSERT INTO `" + table + "`";

    // iterate through table schema
    query += " (";

    for (var i = 0; i < config.database[table].schema.length; i++) {
        query += "`" + config.database[table].schema[i] + "`";
        if (i < (config.database[table].schema.length - 1)) query += ",";
    }

    query += ") VALUES ";

    for (i = 0; i < data.length; i++) {

        query += "(";

        // insert wallet data
        for (var k in data[i]) {

            if (data[i].hasOwnProperty(k)) {

                if (k === 'amount') {
                    query += data[i][k]; // Big Int
                } else {
                    query += "'" + data[i][k] + "', ";
                }

            }
        }

        if ((i+1) !== data.length) query += "),";

    }

    query += ");";

    pool.query(query, function (err, result, fields) {
       if (err) throw new Error(err);

       cb(null, result);
    });
}

async function get(table, opts, cb) {

    var query = "SELECT * from " + table;

    if (opts.filtered) query += " WHERE amount = 0;";

    pool.query(query, function (err, result, fields) {
        if (err) throw new Error(err);

        cb(null, result);
    });
}

async function edit(table, addresses, data, cb) {

    var query = "UPDATE " + table + " SET txid = '" + data.txid + "', amount = " + data.amount + " WHERE address = ";

    for (var i = 0; i < addresses.length; i++) {

        query += "'" + addresses[i] + "'";
        if ((i+1) !== addresses.length) query += " OR address = ";

    }

    pool.query(query, function (err, result, fields) {
        if (err) throw new Error(err);

        cb(null, result);
    });
}

async function del(table, query, cb) {
    var filename = config.database[table].filename;
    var schema = config.database[table].schema;

    const db = await csvdb(filename, schema);
    var result = await db.delete(query);

    cb(null, result);
}

module.exports = {
    add: add,
    get: get,
    edit: edit,
    del: del
};
