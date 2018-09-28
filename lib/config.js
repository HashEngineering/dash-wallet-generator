"use strict";

var config = {
    "network": "mainnet",
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
        "database": "dash_wallet_generator"
    },
    "wallet": {
        address: "yfrpPKKrX836EVKbe3sbwPXQvQjWEPdGkj",
        wif: "cMd3DWj2ZtEVNLaais2Gmi5eFJNYjr4V42etM5kZBNvpbgKwszPq"
    }
};

module.exports = {
    config: config
};
