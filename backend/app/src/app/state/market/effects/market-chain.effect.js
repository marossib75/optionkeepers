import API from "../../../../api/api";
import { HandleAppError } from "../../app.action";
import { UpdateMarketTab } from "../market.action";

import MarketChainAction, { LoadMarketChainFailed, LoadMarketChainSuccess } from "../actions/market-chain.action";
import { ChainChartTemplates } from "../../../enums/chart-type.enum";
import { LoadMarketChart } from "../actions/market-chart.action";

export function marketChainEffect(action, dispatch) {

    switch (action.type) {
        
        case MarketChainAction.Type.LoadMarketChain:
            API.getChain(action.tab.symbol, action.tab.expiration, action.tab.date, action.tab.strategyId)
                .then((chain) => {
                    dispatch(LoadMarketChainSuccess(chain));

                    var tab = {...action.tab, expiration: chain.expiration, date: chain.date };
                    if (tab.charts) {

                        for(var index in ChainChartTemplates) {
                            var key = ChainChartTemplates[index];

                            if (key in tab.charts)
                                dispatch(LoadMarketChart(tab.charts[key], tab));
                        }
                    }
                    dispatch(UpdateMarketTab(tab));
                })
                .catch((err) => {
                    dispatch(LoadMarketChainFailed());
                    dispatch(UpdateMarketTab({...action.tab, expiration: undefined, date: undefined }));
                    dispatch(HandleAppError(err, "", true));
                });
            break;
        default:
            break;
    }
}
