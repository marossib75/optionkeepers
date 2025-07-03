export const ChartType = {
    CandleStick: 'CandleStick',
    Line: 'Line',
    Bar: 'Bar',
    GroupedBar: 'GroupedBar',
    Area: 'Area',
    Loading: 'Loading',
}

export const ChartScaleType = {
    Linear: 'Linear',
    DateTime: 'DateTime',
}

export const ChartTemplate = {
    Loading: 'Loading',
    History: 'History',
    Profit: 'Profit',
    Greeks: 'Greeks',
    Performance: 'Performance',
    VolatilityHistory: 'VolatilityHistory',
    VolatilityVariation: 'VolatilityVariation',
    VolatilityPerStrike: 'VolatilityPerStrike',
    OpenInterestBreakdown: 'OpenInterestBreakdown',
    OpenInterestPressure: 'OpenInterestPressure',
    OpenInterestPerStrike: 'OpenInterestPerStrike',
    OpenInterestPerExpiry: 'OpenInterestPerExpiry',
}

export const MarketChartTemplates = [
    ChartTemplate.History,
    ChartTemplate.VolatilityHistory,
    ChartTemplate.VolatilityVariation,
    ChartTemplate.VolatilityPerStrike,
    ChartTemplate.OpenInterestPerExpiry,
]

export const ChainChartTemplates = [
    ChartTemplate.OpenInterestBreakdown,
    ChartTemplate.OpenInterestPressure,
    ChartTemplate.OpenInterestPerStrike,
]