"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceFeedProvider = exports.PriceFeedSource = exports.SupportedToken = void 0;
var SupportedToken;
(function (SupportedToken) {
    SupportedToken["BTC"] = "BTC";
    SupportedToken["ETH"] = "ETH";
    SupportedToken["SOL"] = "SOL";
    SupportedToken["XRP"] = "XRP";
})(SupportedToken || (exports.SupportedToken = SupportedToken = {}));
var PriceFeedSource;
(function (PriceFeedSource) {
    PriceFeedSource["BINANCE"] = "BINANCE";
    PriceFeedSource["UPBIT"] = "UPBIT";
    PriceFeedSource["BITHUMB"] = "BITHUMB";
    PriceFeedSource["PYTH"] = "PYTH";
    PriceFeedSource["CHAINLINK"] = "CHAINLINK";
})(PriceFeedSource || (exports.PriceFeedSource = PriceFeedSource = {}));
class PriceFeedProvider {
}
exports.PriceFeedProvider = PriceFeedProvider;
//# sourceMappingURL=index.js.map