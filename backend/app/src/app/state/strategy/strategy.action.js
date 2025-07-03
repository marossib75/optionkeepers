import { UnWait, Wait } from "../app.action";

const Type = {
    LoadStrategies: 'LOAD_STRATEGIES',
    LoadStrategiesSuccess: 'LOAD_STRATEGIES_SUCCESS',
    LoadStrategiesFailed: 'LOAD_STRATEGIES_FAILED',

    ToggleStrategyCard: 'TOGGLE_STRATEGY_CARD',
    UpdateStrategyCard: 'UPDATE_STRATEGY_CARD',

    CreateStrategy: 'CREATE_STRATEGY',
    UpdateStrategy: 'UPDATE_STRATEGY',
    ShareStrategy: 'SHARE_STRATEGY',
    RemoveSharedStrategy: 'REMOVE_SHARED_STRATEGY',
    DeleteStrategy: 'DELETE_STRATEGY',

    LoadStrategy: 'LOAD_STRATEGY',
    LoadStrategySuccess: 'LOAD_STRATEGY_SUCCESS',
    LoadStrategyFailed: 'LOAD_STRATEGY_FAILED',

    LoadStrategyPage: 'LOAD_STRATEGY_PAGE',
    LoadStrategyPageSuccess: 'LOAD_STRATEGY_PAGE_SUCCESS',
    LoadStrategyPageFailed: 'LOAD_STRATEGY_PAGE_FAILED',

    ToggleStrategyChart: 'TOGGLE_STRATEGY_CHART',
    LoadStrategyChart: 'LOAD_STRATEGY_CHART',
    LoadStrategyChartSuccess: 'LOAD_STRATEGY_CHART_SUCCESS',
    LoadStrategyChartFailed: 'LOAD_STRATEGY_CHART_FAILED',

    UpvoteStrategy: 'UPVOTE_STRATEGY',
    BookmarkStrategy: 'BOOKMARK_STRATEGY',
}

export function LoadStrategies(pageType, search='', paginationPage, sortField=undefined, sortOrder=undefined) {
    return Wait({type: Type.LoadStrategies, pageType, search, paginationPage, sortField, sortOrder});
}

export function LoadStrategiesSuccess(pagination) {
    return UnWait({type: Type.LoadStrategiesSuccess, pagination});
}

export function LoadStrategiesFailed() {
    return UnWait({type: Type.LoadStrategiesFailed});
}

// STRATEGY

export function CreateStrategy(groupId, name, published) {
    return {type: Type.CreateStrategy, groupId, name, published};
}

export function UpdateStrategy(id, name, published, orders, whatif) {
    return {type: Type.UpdateStrategy, id, name, published, orders, whatif};
}

export function ShareStrategy(strategyId, share_to_userId){
    return {type: Type.ShareStrategy, strategyId, share_to_userId}
}

export function RemoveSharedStrategy(strategyId){
    return {type: Type.RemoveSharedStrategy, strategyId}
}

export function DeleteStrategy(id) {
    return {type: Type.DeleteStrategy, id};
}

export function LoadStrategy(id) {
    return Wait({type: Type.LoadStrategy, id});
}

export function LoadStrategySuccess(strategy, profits) {
    return UnWait({type: Type.LoadStrategySuccess, strategy, profits});
}

export function LoadStrategyFailed(id) {
    return UnWait({type: Type.LoadStrategyFailed, id});
}

// STRATEGY PAGE

export function LoadStrategyPage(id) {
    return Wait({type: Type.LoadStrategyPage, id});
}

export function LoadStrategyPageSuccess(strategy, profits) {
    return UnWait({type: Type.LoadStrategyPageSuccess, strategy, profits});
}

export function LoadStrategyPageFailed(id) {
    return UnWait({type: Type.LoadStrategyPageFailed, id});
}

// STRATEGY CARD

export function ToggleStrategyCard(card, active) {
    return {type: Type.ToggleStrategyCard, card, active};
}

export function UpdateStrategyCard(card) {
    return {type: Type.UpdateStrategyCard, card};
}


// CHART

export function ToggleStrategyChart(id) {
    return {type: Type.ToggleStrategyChart, id};
}

export function LoadStrategyChart(id, chartId) {
    return Wait({type: Type.LoadStrategyChart, id, chartId});
}

export function LoadStrategyChartSuccess(id, chart, data) {
    return UnWait({type: Type.LoadStrategyChartSuccess, id, chart, data});
}

export function LoadStrategyChartFailed(id) {
    return UnWait({type: Type.LoadStrategyChartFailed, id});
}

// INTERACTIONS

export function UpvoteStrategy(id, voteType, search, page, pagination, clubId){
    return {type: Type.UpvoteStrategy, id, voteType, search, page, pagination, clubId}
}

export function BookmarkStrategy(id, voteType, search, page, pagination, clubId){
    return {type: Type.BookmarkStrategy, id, voteType, search, page, pagination, clubId}
}

const StrategyAction = {
    Type
};

export default StrategyAction;
