// STRATEGY API
import { StrategyPageType } from "../app/enums/strategy-page.enum";
import HTTP, {getErrorObj, queryParamsStringfy} from "./http-fetch";

async function getStrategies(groupId, pageType, search, paginationPage, sortField, sortOrder) {
    let response = undefined;
    switch (pageType){
        case StrategyPageType.Personal:
            response = await HTTP.getData('/users/strategies/'+queryParamsStringfy({groupId, search, paginationPage, sortField, sortOrder}))
            break;
        case StrategyPageType.Explore:
            response = await HTTP.getData('/users/strategies/explore/'+queryParamsStringfy({groupId, search, paginationPage, sortField, sortOrder}))
            break;
        case StrategyPageType.Saved:
            response = await HTTP.getData('/users/strategies/saved/'+queryParamsStringfy({groupId, search, paginationPage, sortField, sortOrder}))
            break;
        case StrategyPageType.History:
            response = await HTTP.getData('/users/strategies/history/'+queryParamsStringfy({groupId, search, paginationPage, sortField, sortOrder}))
            break;
        case StrategyPageType.Shared:
            response = await HTTP.getData('/users/strategies/share/'+queryParamsStringfy({groupId, search, paginationPage, sortField, sortOrder}))
        default:
            break;
    }
    if (response.ok) {
        const strategiesJson = await response.json();
        /* if pagination, return object 
            {   "metadata": 
                    [{"total": int, "page": int}, 
                "data": 
                    [strategies]]
            } 
            else only array of strategies 
        */
        if(!strategiesJson.data) return strategiesJson.map(strategy => ({...strategy, id: strategy._id}));
        else {
            return {...strategiesJson, "data": strategiesJson.data.map(strategy => ({...strategy, id: strategy._id}))};
        }        

    } else {
        throw getErrorObj(response, 'Error on load user strategies');
    }
}

async function getStrategy(id) {
    const response = await HTTP.getData('/users/strategies/'+id+'/')
    if (response.ok) {
        const strategyJson = await response.json();
        return {...strategyJson, id: strategyJson._id};
    } else {
        throw getErrorObj(response, 'Error on load user strategy');
    }
}

async function getStrategyProfit(id) {
    const response = await HTTP.getData('/users/strategies/'+ id +'/profit/')
    if (response.ok) {
        const profitJson = await response.json();
        return profitJson;
    } else {
        throw getErrorObj(response, 'Error on load user strategy profit');
    }
}

async function getStrategyGreeks(id) {
    const response = await HTTP.getData('/users/strategies/'+ id +'/greeks/')
    if (response.ok) {
        const profitJson = await response.json();
        return profitJson;
    } else {
        throw getErrorObj(response, 'Error on load user strategy greeks');
    }
}

async function searchMyPublicStrategies(search) {
    const response = await HTTP.getData('/users/strategies/mypublic/'+ queryParamsStringfy({search}))
    if (response.ok){
        const usersJson = await response.json();
        return usersJson;
    }
}

async function updateStrategyUpvote(id, voteType){
    return HTTP.postData('/users/strategies/'+id+'/upvote/', {voteType})
}

async function updateStrategyBookmark(id, voteType){
    return HTTP.postData('/users/strategies/'+id+'/bookmark/', {voteType})
}

async function addStrategyToHistory(id){
    return HTTP.postData('/users/strategies/history/', {id})
}

async function createStrategy(groupId, name, published) {
    return HTTP.postData('/users/strategies/', {groupId, name, published});
}

async function updateStrategy(id, name, published, orders, whatif, disabled=undefined) {
    return HTTP.postData('/users/strategies/'+ id + '/', {name, published, orders, whatif, disabled});
}

async function shareStrategy(strategyId, share_to_userId) {
    return HTTP.postData('/users/strategies/share/', {strategyId, share_to_userId});
}

async function removeShareStrategy(strategyId) {
    return HTTP.deleteData('/users/strategies/share/'+queryParamsStringfy({strategyId}));
}

async function deleteStrategy(id) {
    return HTTP.deleteData('/users/strategies/'+ id + '/');
}

const StrategyAPI = { 
    getStrategies, 
    getStrategy, getStrategyProfit, getStrategyGreeks, 
    searchMyPublicStrategies,
    updateStrategyUpvote, updateStrategyBookmark, addStrategyToHistory,
    createStrategy, updateStrategy, shareStrategy, 
    removeShareStrategy, deleteStrategy,
};

export default StrategyAPI;
