import { UnWait, Wait } from "../app.action";

const Type = {
    LoadMarkets: 'LOAD_MARKETS',
    LoadMarketsSuccess: 'LOAD_MARKETS_SUCCESS',
    LoadMarketsFailed: 'LOAD_MARKETS_FAILED',

    OpenMarketTab: 'OPEN_MARKET_TAB',
    UpdateMarketTab: 'UPDATE_MARKET_TAB',
    CloseMarketTab: 'CLOSE_MARKET_TAB',

    LoadMarket: 'LOAD_MARKET',
    LoadMarketSuccess: 'LOAD_MARKET_SUCCESS',
    LoadMarketFailed: 'LOAD_MARKET_FAILED',

    LoadMarketStrategies: 'LOAD_MARKET_STRATEGIES',
    LoadMarketStrategiesSuccess: 'LOAD_MARKET_STRATEGIES_SUCCESS',
    LoadMarketStrategiesFailed: 'LOAD_MARKET_STRATEGIES_FAILED',
}

export function LoadMarkets(search='') {
    return Wait({type: Type.LoadMarkets, search});
}

export function LoadMarketsSuccess(results) {
    return UnWait({type: Type.LoadMarketsSuccess, results});
}

export function LoadMarketsFailed() {
    return UnWait({type: Type.LoadMarketsFailed});
}

// TAB

export function OpenMarketTab(tab) {
    return {type: Type.OpenMarketTab, tab};
}

export function UpdateMarketTab(tab) {
    return {type: Type.UpdateMarketTab, tab};
}

export function CloseMarketTab(tab, active, next) {
    return {type: Type.CloseMarketTab, tab, active, next};
}

// MARKET

export function LoadMarket(tab) {
    return Wait({type: Type.LoadMarket, tab});
}

export function LoadMarketSuccess(market, strategies) {
    return UnWait({type: Type.LoadMarketSuccess, market, strategies});
}

export function LoadMarketFailed() {
    return UnWait({type: Type.LoadMarketFailed});
}

// STRATEGIES

export function LoadMarketStrategies(groupId, tab) {
    return Wait({type: Type.LoadMarketStrategies, groupId, tab});
}

export function LoadMarketStrategiesSuccess(strategies) {
    return UnWait({type: Type.LoadMarketStrategiesSuccess, strategies});
}

export function LoadMarketStrategiesFailed() {
    return UnWait({type: Type.LoadMarketStrategiesFailed});
}

const MarketAction = {
    Type
};

export default MarketAction;
