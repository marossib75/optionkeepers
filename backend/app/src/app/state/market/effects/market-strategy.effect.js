import API from "../../../../api/api";
import MarketStrategyAction, { LoadMarketStrategy, LoadMarketStrategyFailed, LoadMarketStrategySuccess } from "../actions/market-strategy.action";
import { LoadMarketStrategies} from "../market.action";
import { HandleAppError } from "../../app.action";
import { LoadMarketFutures } from "../actions/market-futures.action";
import { LoadMarketChain } from "../actions/market-chain.action";
import { LoadMarketChart } from "../actions/market-chart.action";
import { ChartTemplate } from "../../../enums/chart-type.enum";
import StrategyCharts from "../../../catalog/charts/strategy.charts";

export function marketStrategyEffect(action, dispatch) {

    switch (action.type) {

        case MarketStrategyAction.Type.LoadMarketStrategy:
            API.getStrategy(action.tab.strategyId)
                .then((strategy) => {
                    dispatch(LoadMarketStrategySuccess(strategy));
                    dispatch(LoadMarketFutures(action.tab));
                    dispatch(LoadMarketChain(action.tab));

                    if (action.tab.charts) {
                        if (ChartTemplate.Greeks in action.tab.charts) {
                            dispatch(LoadMarketChart(StrategyCharts.ProfitGreeks, action.tab));
                        }
                    }
                })
                .catch((err) => {
                    dispatch(LoadMarketStrategyFailed());
                    dispatch(HandleAppError(err));
                });
            break;
            
        case MarketStrategyAction.Type.CreateMarketStrategy:
            API.createStrategy(action.tab.groupId, action.name, action.published)
            .then((strategy) => {
                    dispatch(LoadMarketStrategy({...action.tab, strategyId: strategy.id}));
                    dispatch(LoadMarketStrategies(action.tab.groupId));
                })
                .catch((err) => {
                    dispatch(HandleAppError(err));
                });
            break;

        case MarketStrategyAction.Type.UpdateMarketStrategy:
            API.updateStrategy(action.tab.strategyId, action.name, action.published, action.orders, action.whatif)
                .then(() => {
                    dispatch(LoadMarketStrategy({...action.tab, whatif: action.whatif}));
                    
                    if (action.name)
                        dispatch(LoadMarketStrategies(action.tab.groupId));
                })
                .catch((err) => {
                    dispatch(LoadMarketFutures(action.tab));
                    dispatch(LoadMarketChain(action.tab));
                    dispatch(HandleAppError(err));
                });
            break;

        case MarketStrategyAction.Type.DeleteMarketStrategy:
            API.deleteStrategy(action.tab.strategyId)
                .then(() => {
                    var tab = {...action.tab, strategyId: null};
                    dispatch(LoadMarketFutures(tab));
                    dispatch(LoadMarketChain(tab));
                    dispatch(LoadMarketStrategies(action.tab.groupId));
                })
                .catch((err) => {
                    dispatch(LoadMarketStrategy(action.tab));
                    dispatch(HandleAppError(err));
                });
            break;
        default:
            break;
    }
}
