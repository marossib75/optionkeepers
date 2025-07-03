import ChainChart from "../catalog/charts/chain.charts"
import MarketChart from "../catalog/charts/market.charts"
import PortoflioChart from "../catalog/charts/portfolio.charts"
import StrategyChart from "../catalog/charts/strategy.charts"

// ALL CATALOGS
export const MarketChartCatalog = [
    MarketChart.History,
    StrategyChart.ProfitGreeks,
    MarketChart.VolatilityHistory,
    MarketChart.VolatilityVariation,
    MarketChart.VolatilityPerStrike,
    ChainChart.OpenInterestBreakdown,
    ChainChart.OpenInterestPressure,
    ChainChart.OpenInterestPerStrike,
    MarketChart.OpenInterestPerExpiry,
]

export const StrategyChartCatalog = [
    StrategyChart.Profit,
]

export const PortfolioChartCatalog = [
    PortoflioChart.PortfolioPerformance,
]