import { LoadingState } from "../../app.reducer"
import MarketChainAction from "../actions/market-chain.action";
import MarketStrategyAction from "../actions/market-strategy.action";
import MarketAction from "../market.action";

export const ChainState = {
    ...LoadingState,
    options: [],
    perPage: 10,
}

export function marketChainReducer(state = ChainState, action) {

    switch (action.type) {
        
        case MarketAction.Type.OpenMarketTab:
            return {...ChainState };

        case MarketStrategyAction.Type.LoadMarketStrategy:
            return {...state, loading: true}

        case MarketStrategyAction.Type.LoadMarketStrategyFailed:
        case MarketStrategyAction.Type.LoadMarketStrategySuccess:
            return {...state, loading: false}
            
        // CHAIN
        case MarketChainAction.Type.ToggleMarketChain:
            return {...state, open: !state.open};

        case MarketChainAction.Type.LoadMarketChain:
            return {...state, loading: true, failed: false};

        case MarketChainAction.Type.LoadMarketChainSuccess:
            return {...state, ...action.chain, loading: false};
        
        case MarketChainAction.Type.LoadMarketChainFailed:
            return {...state, loading: false, failed: true};
        
        case MarketChainAction.Type.SetMarketChainPerPage:
            return {...state, perPage: action.perPage};

        default:
            return state;
    }
}