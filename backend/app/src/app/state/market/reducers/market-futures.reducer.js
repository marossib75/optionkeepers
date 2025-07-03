import { LoadingState } from "../../app.reducer";
import MarketMarketFuturesAction from "../actions/market-futures.action";
import MarketStrategyAction from "../actions/market-strategy.action";
import MarketAction from "../market.action";

export const FuturesState = {
    ...LoadingState,
    data: [],
}


export function marketFuturesReducer(state = FuturesState, action) {
    
    switch (action.type) {

        case MarketAction.Type.OpenMarketTab:
            return {...FuturesState };

        case MarketStrategyAction.Type.LoadMarketStrategy:
            return {...state, loading: true}

        case MarketStrategyAction.Type.LoadMarketStrategyFailed:
        case MarketStrategyAction.Type.LoadMarketStrategySuccess:
            return {...state, loading: false}

        // FUTURES
        case MarketMarketFuturesAction.Type.ToggleMarketFutures:
            return {...state, open: !state.open};

        case MarketMarketFuturesAction.Type.LoadMarketFutures:
            return {...state, loading: true, failed: false};

        case MarketMarketFuturesAction.Type.LoadMarketFuturesSuccess:
            return {...state, data: action.data, loading: false};

        case MarketMarketFuturesAction.Type.LoadMarketFuturesFailed:
            return {...state, loading: true, failed: true};

        default:
            return state;
    }
}


