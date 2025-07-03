import { UnWait, Wait } from "../../app.action";

const Type = {
    ToggleMarketChain: 'TOGGLE_MARKET_CHAIN',
    LoadMarketChain: 'LOAD_MARKET_CHAIN',
    LoadMarketChainSuccess: 'LOAD_MARKET_CHAIN_SUCCESS',
    LoadMarketChainFailed: 'LOAD_MARKET_CHAIN_FAILED',
    SetMarketChainPerPage: 'SET_MARKET_CHAIN_PER_PAGE',
}

// CHAIN

export function ToggleMarketChain() {
    return {type: Type.ToggleMarketChain };
}
export function LoadMarketChain(tab) {
    return Wait({type: Type.LoadMarketChain, tab});
}

export function LoadMarketChainSuccess(chain) {
    return UnWait({type: Type.LoadMarketChainSuccess, chain});
}

export function LoadMarketChainFailed() {
    return UnWait({type: Type.LoadMarketChainFailed});
}

export function SetMarketChainPerPage(perPage) {
    return {type: Type.SetMarketChainPerPage, perPage};
}

const MarketChainAction = {
    Type
};

export default MarketChainAction;
