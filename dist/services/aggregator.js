"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceAggregator = void 0;
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
class PriceAggregator {
    cache = new Map();
    aggregatePrice(token, priceFeeds) {
        const now = Date.now();
        const validFeeds = priceFeeds.filter(feed => now - feed.timestamp < config_1.config.aggregation.maxPriceAge);
        if (validFeeds.length < config_1.config.aggregation.minSources) {
            throw new Error(`Insufficient price sources for ${token}: ${validFeeds.length} < ${config_1.config.aggregation.minSources}`);
        }
        const outlierFiltered = this.removeOutliers(validFeeds);
        const weightedPrice = this.calculateWeightedAverage(outlierFiltered);
        const standardDeviation = this.calculateStandardDeviation(outlierFiltered.map(f => f.price));
        const confidence = this.calculateConfidence(outlierFiltered, standardDeviation);
        const aggregatedPrice = {
            symbol: token,
            price: weightedPrice,
            timestamp: now,
            sources: outlierFiltered.map(f => f.source),
            confidence,
            priceFeeds: outlierFiltered,
            weightedAverage: weightedPrice,
            standardDeviation
        };
        this.cache.set(token, aggregatedPrice);
        logger_1.logger.info(`Aggregated price for ${token}: $${weightedPrice.toFixed(2)} from ${outlierFiltered.length} sources`);
        return aggregatedPrice;
    }
    getCachedPrice(token) {
        const cached = this.cache.get(token);
        if (!cached)
            return undefined;
        const age = Date.now() - cached.timestamp;
        if (age > config_1.config.aggregation.maxPriceAge) {
            this.cache.delete(token);
            return undefined;
        }
        return cached;
    }
    removeOutliers(feeds) {
        if (feeds.length <= 2)
            return feeds;
        const prices = feeds.map(f => f.price).sort((a, b) => a - b);
        const median = this.calculateMedian(prices);
        const threshold = config_1.config.aggregation.outlierThreshold;
        return feeds.filter(feed => {
            const deviation = Math.abs(feed.price - median) / median;
            const isOutlier = deviation > threshold;
            if (isOutlier) {
                logger_1.logger.warn(`Removing outlier price from ${feed.source} for ${feed.symbol}: $${feed.price} (${(deviation * 100).toFixed(1)}% from median)`);
            }
            return !isOutlier;
        });
    }
    calculateWeightedAverage(feeds) {
        let totalWeight = 0;
        let weightedSum = 0;
        for (const feed of feeds) {
            let weight = config_1.config.feeds[feed.source]?.weight || 0.1;
            if (feed.confidence !== undefined) {
                weight *= feed.confidence;
            }
            const age = Date.now() - feed.timestamp;
            const ageWeight = Math.max(0.1, 1 - (age / config_1.config.aggregation.maxPriceAge));
            weight *= ageWeight;
            totalWeight += weight;
            weightedSum += feed.price * weight;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    calculateStandardDeviation(prices) {
        if (prices.length <= 1)
            return 0;
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const squaredDifferences = prices.map(price => Math.pow(price - mean, 2));
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / prices.length;
        return Math.sqrt(variance);
    }
    calculateMedian(sortedPrices) {
        const length = sortedPrices.length;
        const middle = Math.floor(length / 2);
        if (length % 2 === 0) {
            return (sortedPrices[middle - 1] + sortedPrices[middle]) / 2;
        }
        else {
            return sortedPrices[middle];
        }
    }
    calculateConfidence(feeds, standardDeviation) {
        let confidence = Math.min(feeds.length / 5, 1);
        if (feeds.length > 1) {
            const prices = feeds.map(f => f.price);
            const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            const coefficientOfVariation = standardDeviation / mean;
            confidence *= Math.max(0.1, 1 - coefficientOfVariation * 2);
        }
        const avgSourceConfidence = feeds
            .filter(f => f.confidence !== undefined)
            .reduce((sum, f) => sum + (f.confidence || 0), 0) / feeds.length;
        if (avgSourceConfidence > 0) {
            confidence = (confidence + avgSourceConfidence) / 2;
        }
        return Math.max(0.1, Math.min(1, confidence));
    }
}
exports.PriceAggregator = PriceAggregator;
//# sourceMappingURL=aggregator.js.map