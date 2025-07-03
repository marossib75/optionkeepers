import { UnWait, Wait } from "../../app.action";

const Type = {
    ToggleMarketChart: 'TOGGLE_MARKET_CHART',
    UnloadMarketChart: 'UNLOAD_MARKET_CHART',
    LoadMarketChart: 'LOAD_MARKET_CHART',
    LoadMarketChartSuccess: 'LOAD_MARKET_CHART_SUCCESS',
    LoadMarketChartFailed: 'LOAD_MARKET_CHART_FAILED',
}

// CHART

export function ToggleMarketChart() {
    return {type: Type.ToggleMarketChart};
}

export function UnloadMarketChart(chart, tab) {
    return UnWait({type: Type.UnloadMarketChart, chart, tab});
}

export function LoadMarketChart(chart, tab) {
    return Wait({type: Type.LoadMarketChart, chart, tab});
}

export function LoadMarketChartSuccess(chart, data) {
    return UnWait({type: Type.LoadMarketChartSuccess, chart, data});
}

export function LoadMarketChartFailed(chart) {
    return UnWait({type: Type.LoadMarketChartFailed, chart});
}

const MarketChartAction = {
    Type
};

export default MarketChartAction;
