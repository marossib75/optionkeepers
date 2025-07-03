import { LoadingState, SearchState } from "../app.reducer";
import { marketChainReducer, ChainState} from "./reducers/market-chain.reducer";
import { marketChartsReducer, ChartsState } from "./reducers/market-chart.reducer";
import { marketFuturesReducer, FuturesState } from "./reducers/market-futures.reducer";
import { marketStrategyReducer, StrategyState } from "./reducers/market-strategy.reducer";

import MarketAction from "./market.action";


const TabState = {
    ...LoadingState,
    charts: {},
    full: true,
}

const MarketState = {
    ...LoadingState,
    open: true,
    underlying: {},
    expirations: [],
    strategies: [],
    futures: FuturesState,
    charts: ChartsState,
    chain: ChainState,
    strategy: StrategyState,
}

const MarketsState = {
    ...LoadingState,
    ...SearchState,
    market: MarketState,
    tab: TabState,
    open: true,
    tabs: {},
}

export function marketsReduce(state = MarketsState, action) {

    state.market = marketReducer(state.market, action);

    switch (action.type) {

        case MarketAction.Type.LoadMarkets:
            return {...state, search: action.search, loading: true, failed: false};

        case MarketAction.Type.LoadMarketsSuccess:
            return {...state, results: action.results, loading: false};

        case MarketAction.Type.LoadMarketsFailed:
            return {...state, results: action.results, loading: false, failed: true};
        

        // TAB

        case MarketAction.Type.OpenMarketTab:
            if (!(action.tab.symbol in state.tabs))
                state.tab = {...TabState, open: true };

            state.tab = {...state.tab, ...action.tab};
            state.tabs[state.tab.symbol] = state.tab;
            return {...state };

        case MarketAction.Type.UpdateMarketTab:
            if (state.tab.symbol === action.tab.symbol){
                state.tab = {...state.tab, ...action.tab};
                state.tabs[state.tab.symbol] = state.tab;
            }
            return {...state };
        
        case MarketAction.Type.CloseMarketTab:
            if (action.tab.symbol in state.tabs)
                delete state.tabs[action.tab.symbol];

            return {...state, tab: action.tab.symbol === state.tab.symbol ? TabState : state.tab, tabs: {...state.tabs}};

        default:
            return {...state};
    }
}

function marketReducer(state = MarketState, action) {

    state.charts = marketChartsReducer(state.charts, action);
    state.futures = marketFuturesReducer(state.futures, action);
    state.chain = marketChainReducer(state.chain, action);
    state.strategy = marketStrategyReducer(state.strategy, action);

    switch (action.type) {

        case MarketAction.Type.LoadMarket:
            return {...state, loading: false};

        case MarketAction.Type.LoadMarketSuccess:
            return {...state, ...action.market, strategies: action.strategies, loading: false};

        case MarketAction.Type.LoadMarketFailed:
            return {...state, loading: false, failed: true};
    
        case MarketAction.Type.LoadMarketStrategiesSuccess:
            return {...state, strategies: action.strategies};

        default:
            return state;
    }
}