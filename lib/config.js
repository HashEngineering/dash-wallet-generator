"use strict";

var config = {
    "network": "testnet",
    "insight_api": "https://insight.dashevo.org/",
    "insight_api_testnet": "http://testnet-insight.dashevo.org/",
    "api_prefix": "insight-api-dash",
    "database": {
        "wallets": {
            filename: "wallets.csv",
            schema: ["address","wif","txid","amount"]
        },
        "swept": {
            filename: "wallets_swept.csv",
            schema: ["funded_address","swept_address","txid","amount"]
        },
        "spent": {
            filename: "wallets_spent.csv",
            schema: ["funded_address","spent_address","txid","amount"]
        }
    },
    "mysql": {
        "user": "walletgen",
        "password": "password1234",
        "database": "KMTest"
    },
    "wallet": {
        address: "yfQMHoUDJoZCKQBtwcHYwCNAxwyszCuS9d",
        privateKey: "cR9NuMof5JVUvJVT8qnfisqzDTcZuMz2LexG3nm62rzCWdQn2dj5"
    }
};

module.exports = {
    config: config
};
