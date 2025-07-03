// CHART API
import { ChartTemplate } from "../app/enums/chart-type.enum";
import ChainAPI from "./chain.api";
import { getErrorObj } from "./http-fetch";
import MarketAPI from "./market.api";
import StrategyAPI from "./strategy.api";

async function getChart(chart, params) {
    switch(chart.id) {
        case ChartTemplate.History:
            return MarketAPI.getMarketHistory(params.symbol);
            
        case ChartTemplate.Profit:
            return StrategyAPI.getStrategyProfit(params.strategyId)

        case ChartTemplate.Greeks:
            return Promise.all([
                StrategyAPI.getStrategyProfit(params.strategyId),
                StrategyAPI.getStrategyGreeks(params.strategyId)]);

        case ChartTemplate.VolatilityHistory:
            return MarketAPI.getMarketVolatilityHistory(params.symbol);

        case ChartTemplate.VolatilityPerStrike:
            return MarketAPI.getMarketVolatilityPerStrike(params.symbol, params.expiration)                

        case ChartTemplate.VolatilityVariation:
            return ChainAPI.getChainVolatilityVariation(params.symbol, params.expiration, params.date)

        case ChartTemplate.OpenInterestPerStrike:
            return ChainAPI.getChainOpenInterest(params.symbol, params.expiration, params.date);
        
        case ChartTemplate.OpenInterestPressure:
        case ChartTemplate.OpenInterestBreakdown:
            return ChainAPI.getChainOpenInterestCumulative(params.symbol, params.expiration, params.date);

        case ChartTemplate.OpenInterestPerExpiry:
            return MarketAPI.getMarketOpenInterest(params.symbol, params.expiration);

        default:
            throw getErrorObj({status: '-'}, 'Error on chart type specified');
    }
}

const ChartAPI = { getChart };

export default ChartAPI;
