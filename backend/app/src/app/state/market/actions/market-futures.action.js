import { UnWait, Wait } from "../../app.action";

const Type = {
    ToggleMarketFutures: 'TOGGLE_MARKET_FUTURES',
    LoadMarketFutures: 'LOAD_MARKET_FUTURES',
    LoadMarketFuturesSuccess: 'LOAD_MARKET_FUTURES_SUCCESS',
    LoadMarketFuturesFailed: 'LOAD_MARKET_FUTURES_FAILED',
}

// FUTURE

export function ToggleMarketFutures() {
    return {type: Type.ToggleMarketFutures };
}

export function LoadMarketFutures(tab) {
    return Wait({type: Type.LoadMarketFutures, tab});
}

export function LoadMarketFuturesSuccess(data) {
    return UnWait({type: Type.LoadMarketFuturesSuccess, data});
}

export function LoadMarketFuturesFailed() {
    return UnWait({type: Type.LoadMarketFuturesFailed});
}

const MarketMarketFuturesAction = {
    Type
};

export default MarketMarketFuturesAction;
