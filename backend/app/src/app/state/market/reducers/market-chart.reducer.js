import { ChartState, LoadingState } from "../../app.reducer";
import MarketChartAction from "../actions/market-chart.action";
import MarketAction from "../market.action";

export const ChartsState = {
    ...LoadingState,
    elements: {},
    open: true,
}

export function marketChartsReducer(state = ChartsState, action) {

    // CHART
    switch (action.type) {

        case MarketAction.Type.OpenMarketTab:
            return {...state, elements: {}};

        case MarketChartAction.Type.ToggleMarketChart:
            return {...state, open: !state.open};

        case MarketChartAction.Type.UnloadMarketChart:
            if (action.chart.id in state.elements) {
                delete state.elements[action.chart.id];
                state = {...state, elements: {...state.elements}}
            }
            return state;

        case MarketChartAction.Type.LoadMarketChart:
            if (action.chart.id in state.elements) {
                state.elements[action.chart.id] = {...state.elements[action.chart.id], loading: true, failed: false};
            } else {
                state.elements[action.chart.id] = {...ChartState, ...action.chart, open: true, loading: true};
            }
            return {...state, elements: {...state.elements}};

        case MarketChartAction.Type.LoadMarketChartSuccess:
            if (action.chart.id in state.elements) {
                state.elements[action.chart.id] = {...state.elements[action.chart.id], ...action.chart, ...action.data, loading: false};
            }
            return {...state, elements: {...state.elements}};

        case MarketChartAction.Type.LoadMarketChartFailed:
            if (action.chart.id in state.elements) {
                state.elements[action.chart.id] = {...state.elements[action.chart.id], loading: false, failed: true};
            }
            return {...state, elements: {...state.elements}};

        default:
            return state;
    }
}


