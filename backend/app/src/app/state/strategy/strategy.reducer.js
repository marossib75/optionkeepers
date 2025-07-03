import { StrategyChartCatalog as ChartCatalog} from "../../enums/chart-catalog.enum";
import { StrategyPageType } from "../../enums/strategy-page.enum";
import { ChartState, LoadingState, SearchState } from "../app.reducer";
import StrategyAction from "./strategy.action";

export const StrategyState = {
    ...LoadingState,
    chart: {...ChartState, full: false},
    full: false,
    open: true,
    markets: [],
    positions: [],
    stats: {
        original: {}
    },
    upvotes: [],
    bookmarks: [],
    published: false,
}

const StrategiesState = {
    ...LoadingState,
    ...SearchState,
    open: true,
    cards: {},
    charts: ChartCatalog,
    page: StrategyPageType.Personal,
    pagination: {},
    strategy: {
        ...StrategyState,
    },
};

export function strategiesReducer(state = StrategiesState, action) {

    switch (action.type) {

        case StrategyAction.Type.LoadStrategies:
            return {...state, page: action.pageType, search: action.search, loading: true, failed: false}

        case StrategyAction.Type.LoadStrategiesSuccess:
            // the returned pagination can contain either 2 fields (metadata: [{}] and data: []) if there is pagination, or one array
            let pagination = action.pagination.metadata ? action.pagination.metadata[0] : {}
            let results = action.pagination.metadata ? action.pagination.data : action.pagination
            return {...state, results: results, pagination: pagination, loading: false};

        case StrategyAction.Type.LoadStrategiesFailed:
            return {...state, loading: false, failed: true};

         // Card
         case StrategyAction.Type.ToggleStrategyCard:
            if (!action.active) {
                state.cards[action.card.id] = {...StrategyState, ...action.card};
            } else {
                delete state.cards[action.card.id];
            }
            return {...state, cards: {...state.cards}};


        case StrategyAction.Type.UpdateStrategyCard:
            if (action.card.id in state.cards) {
                var card = state.cards[action.card.id];
                state.cards[action.card.id] = {...card, ...action.card};
            }
            return {...state, cards: {...state.cards}};
        
        // Strategy

        case StrategyAction.Type.LoadStrategy:
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, loading: true, failed: false};
            }
            return {...state, cards: {...state.cards}};

        case StrategyAction.Type.LoadStrategySuccess:
            if (action.strategy.id in state.cards) {
                var strategy = state.cards[action.strategy.id];
                state.cards[action.strategy.id] = {...strategy, ...action.strategy, profits: action.profits, loading: false};
            }
            return {...state, cards: {...state.cards}};

        case StrategyAction.Type.LoadStrategyFailed:
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, loading: false, failed: true};
            }
            return {...state, cards: {...state.cards}};

        // Page

        case StrategyAction.Type.LoadStrategyPage:
            return {...state, loading: true, failed: false}

        case StrategyAction.Type.LoadStrategyPageSuccess:
            return {...state, strategy: action.strategy, loading: false};

        case StrategyAction.Type.LoadStrategyPageFailed:
            return {...state, loading: false, failed: true};


        // CHART:
        case StrategyAction.Type.ToggleStrategyChart:
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, chart: {...card.chart, open: !card.chart.open, full: !card.chart.full}};
            }
            return {...state, cards: {...state.cards}};

        case StrategyAction.Type.LoadStrategyChart: 
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, chart: {...card.chart, loading: true, failed: false}};
            }
            return {...state, cards: {...state.cards}};
            

        case StrategyAction.Type.LoadStrategyChartSuccess:
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, chart: {...card.chart, ...action.chart, ...action.data, loading: false}};
            }
            return {...state, cards: {...state.cards}};

        case StrategyAction.Type.LoadStrategyChartFailed:
            if (action.id in state.cards) {
                var card = state.cards[action.id];
                state.cards[action.id] = {...card, chart: {...card.chart, items: [], params: {}, loading: false, failed: true}};
            }
            return {...state, cards: {...state.cards}};
    
        default:
            return {...state, cards: {...state.cards}};
    }
}
