import API from "../../../api/api";
import { StrategyChartCatalog as ChartCatalog } from "../../enums/chart-catalog.enum";
import { StrategyPageType } from "../../enums/strategy-page.enum";

import { HandleAppError, NavigateTo, SetAppLoader } from "../app.action";
import { LoadClub } from "../club/club.action";
import StrategyAction, 
{ LoadStrategies, LoadStrategiesFailed, LoadStrategiesSuccess, LoadStrategy,
LoadStrategyChart, LoadStrategyChartFailed, LoadStrategyChartSuccess, LoadStrategyFailed, LoadStrategyPage, LoadStrategyPageChart, LoadStrategyPageSuccess, LoadStrategySuccess, ToggleStrategyCard } from "./strategy.action";


export function strategiesEffect(action, dispatch) {

    switch (action.type) {
    
        case StrategyAction.Type.LoadStrategies:
            dispatch(SetAppLoader(true))
            API.getStrategies(null, action.pageType, action.search, action.paginationPage, action.sortField, action.sortOrder)
                .then((paginatedResults) => {
                    dispatch(LoadStrategiesSuccess(paginatedResults));
                })
                .catch((err) => {
                    dispatch(LoadStrategiesFailed());
                    dispatch(HandleAppError(err));
                })
                .finally(() => dispatch(SetAppLoader(false)));
            break;

        case StrategyAction.Type.LoadStrategy:
            API.getStrategy(action.id)
            .then((strategy)=> {
                dispatch(LoadStrategySuccess(strategy, []));
                dispatch(LoadStrategyChart(action.id, 0))
            })
            .catch((err) => {
                dispatch(LoadStrategyFailed(action.id));
                dispatch(HandleAppError(err));
            });
            break;

        case StrategyAction.Type.LoadStrategyPage:
            dispatch(SetAppLoader(true))
            API.getStrategy(action.id)
            .then((strategy)=> {
                dispatch(LoadStrategyPageSuccess(strategy, []));
                
            })
            .catch((err) => {
                dispatch(LoadStrategyFailed(action.id));
                dispatch(HandleAppError(err));
            })
            .finally(() => dispatch(SetAppLoader(false)));
            break;

        case StrategyAction.Type.CreateStrategy:
            API.createStrategy(action.groupId, action.name, action.published)
            .then(() => dispatch(LoadStrategies(StrategyPageType.Personal, '', 1)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case StrategyAction.Type.UpdateStrategy:
            API.updateStrategy(action.id, action.name, action.published, action.orders, action.whatif)
            .then(() => {
                dispatch(LoadStrategy(action.id))
                dispatch(LoadStrategyPage(action.id))
            })
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case StrategyAction.Type.ShareStrategy:
            API.shareStrategy(action.strategyId, action.share_to_userId)
            .catch((err) => dispatch(HandleAppError(err)));
            break;
        
        case StrategyAction.Type.LoadStrategyChart:
            var chart = action.chartId < ChartCatalog.length ? ChartCatalog[action.chartId] : ChartCatalog[0];
            var params = {strategyId: action.id, chartId: action.chartId};
            if (chart && chart.checkRequisits(params)) {
                API.getChart(chart, params)
                    .then((data) => {
                        dispatch(LoadStrategyChartSuccess(action.id, chart, chart.getData(data)));
                    })
                    .catch((err) => {
                        dispatch(LoadStrategyChartFailed(action.id));
                        dispatch(HandleAppError(err));
                    });
            } else {
                setTimeout(() => {
                    dispatch(LoadStrategyChartSuccess(chart, {params:{}, items: []}));
                }, 300);
            }
            
            break;
        
        case StrategyAction.Type.UpvoteStrategy:
            API.updateStrategyUpvote(action.id, action.voteType)
            .then(() => {
                dispatch(LoadStrategy(action.id))
                // reload the list with the updated number
                if(action.clubId) dispatch(LoadClub(action.clubId))
                else dispatch(LoadStrategies(action.page, action.search, action.pagination.page))
            })
            .catch((err) => dispatch(HandleAppError(err)));
            break;
        
        case StrategyAction.Type.BookmarkStrategy:
            API.updateStrategyBookmark(action.id, action.voteType)
            .then(() => {
                dispatch(LoadStrategy(action.id))
                // reload the list with the updated number either in the club page or strategies page
                if(action.clubId) dispatch(LoadClub(action.clubId))
                else dispatch(LoadStrategies(action.page, action.search, action.pagination.page))
            })
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case StrategyAction.Type.ToggleStrategyCard:
            API.addStrategyToHistory(action.card.id)
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case StrategyAction.Type.RemoveSharedStrategy:
            API.removeShareStrategy(action.strategyId)
            .then(() => {
                dispatch(LoadStrategies('Shared With Me Strategies', '', 1))  
            })
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case StrategyAction.Type.DeleteStrategy:
            API.deleteStrategy(action.id)
            .then(() => {
                let card = {id: action.id}
                dispatch(ToggleStrategyCard(card, true))
                dispatch(NavigateTo('/app/strategies'))
            })
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        default:
            break;
    }
}
