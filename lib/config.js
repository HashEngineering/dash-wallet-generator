"use strict";

var config = {
    "network": "testnet",
    "insight_api": "https://insight.dashevo.org/",
    "insight_api_testnet": "http://testnet-insight.dashevo.org/",
    "api_prefix": "insight-api-dash",
    "database": {
        "wallets": {
            schema: ["address","wif","txid","amount"]
        },
        "swept": {
            schema: ["funded_address","swept_address","txid","amount"]
        },
        "spent": {
            schema: ["funded_address","spent_address","txid","amount"]
        }
    },
    "mysql": {
        "user": "root",
        "password": ")XBnps7{L>wVquWn",
        "database": "test3"
    },
    "wallet": {
        address: "yX5jcVr6KEwznhwgFUBD3RWoCRWLL5uLMg",
        privateKey: "cQjgMVcqYRtk7mkZ5xZyrKmiEqZMUWgChkxLToXeG48DZSWm9ftk"
    },
    "maxTx": 1000
};

module.exports = {
    config: config
};
