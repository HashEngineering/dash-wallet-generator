"use strict";

var config = {
    "network": "testnet",
    "insight_api": "https://insight.dashevo.org/",
    "insight_api_testnet": "http://test-insight.slayer.work/",
    "api_prefix": "insight-api-dash",
    "database": {
        "wallets": {
            filename: "wallets.csv",
            schema: ["address","wif","txid","amount"]
        }
    },
    "wallet": {
        address: "yXhjjVKb7u67kXLMjUjUwLaNHjJFkoJqdJ",
        wif: "cTwTJX2bGERxymwoB5Lmzg1kfywR56iaaxNtncRPjRq1zqoqk94X"
    }
};

module.exports = {
    config: config
};
