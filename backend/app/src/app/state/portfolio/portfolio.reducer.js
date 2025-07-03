import { PortfolioChartCatalog as ChartCatalog} from "../../enums/chart-catalog.enum";
import { ChartState, LoadingState } from "../app.reducer";
import PortfolioAction from "./portfolio.action";

const PortfolioState = {
    ...LoadingState,
    currency: "USD",
    value: 0,
    stats: {},
    chart: {...ChartState, full: false},
    strategies: [],
    charts: ChartCatalog,
}

export function portfolioReducer(state = PortfolioState, action) {

    switch (action.type) {

        // Portfolio

        case PortfolioAction.Type.LoadPortfolio:
            return {...state, loading: true, failed: false};

        case PortfolioAction.Type.LoadPortfolioSuccess:
            return {...state, ...action.portfolio, loading: false};

        case PortfolioAction.Type.LoadPortfolioFailed:
            return {...state, loading: false, failed: true};

        case PortfolioAction.Type.SetPortfolioPerformanceChart:
            var chart = action.id < ChartCatalog.length ? ChartCatalog[action.id] : ChartCatalog[0];
            return {...state, chart: {...chart, ...action.data}}
                
        default:
            return {...state };
    }
}
