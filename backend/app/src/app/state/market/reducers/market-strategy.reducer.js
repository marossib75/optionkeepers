import { LoadingState } from "../../app.reducer";
import MarketStrategyAction from "../actions/market-strategy.action";
import MarketAction from "../market.action";

export const StrategyState = {
    ...LoadingState,
    positions: [],
    stats: {
        original: {},
        whatif: {},
    },
    whatif: {},
}

export function marketStrategyReducer(state = StrategyState, action) {
    
    switch (action.type) {
        
        case MarketAction.Type.OpenMarketTab:
            return {...StrategyState };

        // STRATEGY
        case MarketStrategyAction.Type.ToggleMarketStrategy:
            return {...state, open: !state.open};

        case MarketStrategyAction.Type.DeleteMarketStrategy:
            return {...StrategyState, open: state.open};

        case MarketStrategyAction.Type.LoadMarketStrategy:
            return {...state, loading: true, failed: false};

        case MarketStrategyAction.Type.LoadMarketStrategySuccess:
            return {...state, ...action.strategy, loading: false};
        
        case MarketStrategyAction.Type.LoadMarketStrategyFailed:
            return {...state, loading: false, failed: true};

        default:
            return state;
    }
}


