import { UnWait, Wait } from "../../app.action";

const Type = {    
    ToggleMarketStrategy: 'TOGGLE_MARKET_STRATEGY',
    CreateMarketStrategy: 'CREATE_MARKET_STRATEGY',
    UpdateMarketStrategy: 'UPDATE_MARKET_STRATEGY',
    DeleteMarketStrategy: 'DELETE_MARKET_STRATEGY',
    LoadMarketStrategy: 'LOAD_MARKET_STRATEGY',
    LoadMarketStrategySuccess: 'LOAD_MARKET_STRATEGY_SUCCESS',
    LoadMarketStrategyFailed: 'LOAD_MARKET_STRATEGY_FAILED',
}

// STRATEGY

export function ToggleMarketStrategy() {
    return {type: Type.ToggleMarketStrategy };
}

export function CreateMarketStrategy(tab, name, published) {
    return {type: Type.CreateMarketStrategy, tab, name, published};
}

export function UpdateMarketStrategy(tab, name, published, orders, whatif) {
    return {type: Type.UpdateMarketStrategy, tab, name, published, orders, whatif};
}

export function DeleteMarketStrategy(tab) {
    return {type: Type.DeleteMarketStrategy, tab};
}

export function LoadMarketStrategy(tab) {
    return Wait({type: Type.LoadMarketStrategy, tab});
}

export function LoadMarketStrategySuccess(strategy) {
    return UnWait({type: Type.LoadMarketStrategySuccess, strategy});
}

export function LoadMarketStrategyFailed() {
    return UnWait({type: Type.LoadMarketStrategyFailed});
}

const MarketStrategyAction = {
    Type
};

export default MarketStrategyAction;
