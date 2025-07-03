import API from "../../../../api/api";

import { HandleAppError } from "../../app.action";
import { UpdateMarketTab } from "../market.action";
import MarketChartAction,
    { LoadMarketChartFailed, LoadMarketChartSuccess } from "../actions/market-chart.action";

export function marketChartEffect(action, dispatch) {
    
    switch (action.type) {

        case MarketChartAction.Type.UnloadMarketChart:
            var charts = {...action.tab.charts};
            if (action.chart.id in charts)
                delete charts[action.chart.id];
            dispatch(UpdateMarketTab({...action.tab, charts}));
            break;

        case MarketChartAction.Type.LoadMarketChart:
            var {chart, tab} = action;
            var charts = {...action.tab.charts};

            charts[action.chart.id] = action.chart;
            dispatch(UpdateMarketTab({...action.tab, charts}));

            if (chart && !chart.disabled) {
                API.getChart(chart, tab)
                    .then((data) => {
                        dispatch(LoadMarketChartSuccess(chart, chart.getData(data)));
                    })
                    .catch((err) => {
                        dispatch(LoadMarketChartFailed(chart));
                        dispatch(HandleAppError(err, "", true));
                    });
            } else {
                setTimeout(() => {
                    dispatch(LoadMarketChartSuccess(chart, {params:{}, items: []}));
                }, 300);
            }
            
            break;

        default:
            break;
    }
}
