import API from "../../../api/api";
import { HandleAppError, SetAppLoader } from "../app.action";
import { LoadMarketChain } from "./actions/market-chain.action";
import { LoadMarketFutures } from "./actions/market-futures.action";
import { LoadMarketStrategy } from "./actions/market-strategy.action";
import { marketChartEffect } from "./effects/market-chart.effect";
import { marketStrategyEffect } from "./effects/market-strategy.effect";
import { marketFuturesEffect } from "./effects/market-futures.effect";
import { marketChainEffect } from "./effects/market-chain.effect";
import MarketAction, { 
    LoadMarket, LoadMarketFailed, LoadMarketsFailed, LoadMarketsSuccess,
    LoadMarketStrategiesFailed, LoadMarketStrategiesSuccess,
    LoadMarketSuccess, OpenMarketTab, 
} from "./market.action";
import { LoadMarketChart } from "./actions/market-chart.action";
import MarketChart from "../../catalog/charts/market.charts";
import { MarketChartTemplates } from "../../enums/chart-type.enum";
import { StrategyPageType } from "../../enums/strategy-page.enum";

export function marketsEffect(action, dispatch) {

    marketEffect(action, dispatch);

    switch (action.type) {

        case MarketAction.Type.LoadMarkets:
            dispatch(SetAppLoader(true));

            API.getMarkets(action.search)
                .then((results) => {
                    dispatch(LoadMarketsSuccess(results));
                })
                .catch((err) => {
                    dispatch(LoadMarketsFailed());
                    dispatch(HandleAppError(err));
                })
                .finally(() => {
                    dispatch(SetAppLoader(false));
                });
            break;

        case MarketAction.Type.OpenMarketTab:
            dispatch(LoadMarket(action.tab));
            break;

        case MarketAction.Type.CloseMarketTab:
            if (action.tab.symbol === action.active.symbol && action.next)
                dispatch(OpenMarketTab(action.next));
            break;

        default:
            break;
    }
}


function marketEffect(action, dispatch) {

    marketChartEffect(action, dispatch);

    marketStrategyEffect(action, dispatch);
    
    marketFuturesEffect(action, dispatch);
    
    marketChainEffect(action, dispatch);
    
    switch (action.type) {

        case MarketAction.Type.LoadMarket:
            Promise.all([
                API.getMarket(action.tab.symbol),
                API.getStrategies(action.tab.groupId, StrategyPageType.Personal)
            ])
                .then((data) => {
                    var market = data[0];
                    var strategies = data[1] || [];                    
                    dispatch(LoadMarketSuccess(market, strategies));

                    if (strategies.length > 0) {
                        
                        if (strategies.filter(s => s.id === action.tab.strategyId).length > 0) 
                            dispatch(LoadMarketStrategy(action.tab));

                        else if (strategies[0] && strategies[0].id)
                            dispatch(LoadMarketStrategy({...action.tab, strategyId: strategies[0].id}));

                    } else {
                        var tab = {...action.tab, strategyId: undefined};
                        dispatch(LoadMarketFutures(tab));
                        dispatch(LoadMarketChain(tab));
                    }

                    if (action.tab.charts) {
                        for(var index in MarketChartTemplates) {
                            var key = MarketChartTemplates[index];
                            
                            if (key in action.tab.charts)
                                dispatch(LoadMarketChart(action.tab.charts[key], action.tab));
                        }
                    } else {
                        dispatch(LoadMarketChart(MarketChart.History, action.tab));
                    }
                })
                .catch((err) => {
                    dispatch(LoadMarketFailed());
                    dispatch(HandleAppError(err));
                });
            break;
            
        case MarketAction.Type.LoadMarketStrategies:
            API.getStrategies(action.groupId, StrategyPageType.Personal)
                .then((strategies) => {
                    dispatch(LoadMarketStrategiesSuccess(strategies));
                })
                .catch((err) => {
                    dispatch(LoadMarketStrategiesFailed());
                    dispatch(HandleAppError(err));
                });
            break;

        default:
            break;
    }
}
