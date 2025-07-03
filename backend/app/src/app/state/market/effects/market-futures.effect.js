import API from "../../../../api/api";
import { HandleAppError } from "../../app.action";
import MarketMarketFuturesAction, { LoadMarketFuturesFailed, LoadMarketFuturesSuccess } from "../actions/market-futures.action";

export function marketFuturesEffect(action, dispatch) {
    
    switch (action.type) {
    
        case MarketMarketFuturesAction.Type.LoadMarketFutures:
            API.getMarketFutures(action.tab.symbol, action.tab.strategyId)
                .then((futures) => {
                    dispatch(LoadMarketFuturesSuccess(futures))
                })
                .catch((err) => {
                    dispatch(LoadMarketFuturesFailed());
                    dispatch(HandleAppError(err));
                });
            break;

        default:
            break;
    }
}
