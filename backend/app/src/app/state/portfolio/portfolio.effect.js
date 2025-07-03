import { error } from "toastr";
import API from "../../../api/api";
import { PortfolioChartCatalog as ChartCatalog } from "../../enums/chart-catalog.enum";

import { HandleAppError, SetAppLoader } from "../app.action";
import PortfolioAction, 
{ LoadPortfolio, LoadPortfolioFailed, LoadPortfolioSuccess, SetPortfolioPerformanceChart } from "./portfolio.action";


export function portflioEffect(action, dispatch) {

    switch (action.type) {

        case PortfolioAction.Type.LoadPortfolio:
            dispatch(SetAppLoader(true));
            API.getPortfolio(action.id)
            .then((portfolio)=> {
                dispatch(LoadPortfolioSuccess(portfolio));

                var chart = ChartCatalog[0];
                if (chart.checkRequisits(portfolio.stats))
                    dispatch(SetPortfolioPerformanceChart(chart.id, chart.getData(portfolio.stats)))
            })
            .catch((err) => {
                dispatch(LoadPortfolioFailed(action.id));
                dispatch(HandleAppError(err));
            })
            .finally(() => dispatch(SetAppLoader(false)));
            break;

        case PortfolioAction.Type.CreatePortfolio:
            API.createPortfolio(action.userId, action.name)
            .then((id) => dispatch(LoadPortfolio(id)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case PortfolioAction.Type.UpdatePortfolio:
            API.updatePortfolio(action.id, action.strategyId)
            .then(() => dispatch(LoadPortfolio(action.id)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case PortfolioAction.Type.TogglePortfolioStrategy:
            API.updateStrategy(action.strategyId, null, null, null, null, !action.disabled)
            .then(() => dispatch(LoadPortfolio(action.id)))
            .catch((err) => dispatch(HandleAppError(err)))
        default:
            break;
    }
}
