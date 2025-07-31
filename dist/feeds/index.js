"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkFeed = exports.PythFeed = exports.BithumbFeed = exports.UpbitFeed = exports.BinanceFeed = void 0;
var binance_1 = require("./binance");
Object.defineProperty(exports, "BinanceFeed", { enumerable: true, get: function () { return binance_1.BinanceFeed; } });
var upbit_1 = require("./upbit");
Object.defineProperty(exports, "UpbitFeed", { enumerable: true, get: function () { return upbit_1.UpbitFeed; } });
var bithumb_1 = require("./bithumb");
Object.defineProperty(exports, "BithumbFeed", { enumerable: true, get: function () { return bithumb_1.BithumbFeed; } });
var pyth_1 = require("./pyth");
Object.defineProperty(exports, "PythFeed", { enumerable: true, get: function () { return pyth_1.PythFeed; } });
var chainlink_1 = require("./chainlink");
Object.defineProperty(exports, "ChainlinkFeed", { enumerable: true, get: function () { return chainlink_1.ChainlinkFeed; } });
//# sourceMappingURL=index.js.map