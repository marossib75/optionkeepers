import { UnWait, Wait } from "../app.action";

const Type = {
    LoadClubs: 'LOAD_CLUBS',
    LoadClubsSuccess: 'LOAD_CLUBS_SUCCESS',
    LoadClubsFailed: 'LOAD_CLUBS_FAILED',

    CreateClub: 'CREATE_CLUB',
    UpdateClubSettings: 'UPDATE_CLUB_SETTINGS',

    AddMemberClub: 'ADD_MEMBER_CLUB',
    RemoveMemberCLub: 'REMOVE_MEMBER_CLUB',
    PromoteToAdmin: 'PROMOTE_TO_ADMIN',
    DemoteAdmin: 'DEMOTE_ADMIN',

    AddStrategyToClub: 'ADD_STRATEGY_TO_CLUB',
    RemoveStrategyFromClub: 'REMOVE_STRATEGY_FROM_CLUB',

    LoadClub: 'LOAD_CLUB',
    LoadClubSuccess: 'LOAD_CLUB_SUCCESS',
    LoadClubFailed: 'LOAD_CLUB_FAILED',

    LoadClubPage: 'LOAD_CLUB_PAGE',

    UpvoteClub: 'UPVOTE_CLUB',
    
    CloseClub: 'CLOSE_CLUB',

    ToggleClubStrategyCard: 'TOGGLE_CLUB_STRATEGY_CARD',
    UpdateClubStrategyCard: 'UPDATE_CLUB_STRATEGY_CARD',

    ToggleClubStrategyChart: 'TOGGLE_CLUB_STRATEGY_CHART',
    LoadClubStrategyChart: 'LOAD_CLUB_STRATEGY_CHART',
    LoadClubStrategyChartSuccess: 'LOAD_CLUB_STRATEGY_CHART_SUCCESS',
    LoadClubStrategyChartFailed: 'LOAD_CLUB_STRATEGY_CHART_FAILED',

    LoadClubStrategy: 'LOAD_CLUB_STRATEGY',
    LoadClubStrategySuccess: 'LOAD_CLUB_STRATEGY_SUCCESS',
    LoadClubStrategyFailed: 'LOAD_CLUB_STRATEGY_FAILED',

}
// Load multiple

export function LoadClubs(pageType, search='', paginationPage, sortField=undefined, sortOrder=undefined) {
    return Wait({type: Type.LoadClubs, pageType, search, paginationPage, sortField, sortOrder});
}

export function LoadClubsSuccess(pagination) {
    return UnWait({type: Type.LoadClubsSuccess, pagination});
}

export function LoadClubsFailed() {
    return UnWait({type: Type.LoadClubsFailed});
}

// Management

export function CreateClub(name, published, description, img_path, links) {
    return {type: Type.CreateClub, name, published, description, img_path, links};
}

export function UpdateClubSettings(id, name, published, description, img_path, links) {
    return {type: Type.UpdateClubSettings, id, name, published, description, img_path, links};
}

export function AddMemberClub(username, clubId) {
    return {type:Type.AddMemberClub, username, clubId}
}

export function RemoveMemberCLub(username, clubId) {
    return {type:Type.RemoveMemberCLub, username, clubId}
}

export function PromoteToAdmin(clubId, username) {
    return {type:Type.PromoteToAdmin, clubId, username}
}

export function DemoteAdmin(clubId, username){
    return {type: Type.DemoteAdmin, clubId, username}
}

export function UpvoteClub(clubId, voteType) {
    return {type: Type.UpvoteClub, clubId, voteType}
}

export function CloseClub(id){
    return {type: Type.CloseClub, id}
}

// Load single one

export function LoadClub(id) {
    return Wait({type: Type.LoadClub, id});
}

export function LoadClubPage(creator_userId, name) {
    return Wait({type: Type.LoadClubPage, creator_userId, name});
}

export function LoadClubSuccess(club) {
    return UnWait({type: Type.LoadClubSuccess, club});
}

export function LoadClubFailed(creator_userId, name) {
    return UnWait({type: Type.LoadClubFailed, creator_userId, name});
}


// Club Strategies

export function AddStrategyToClub(clubId, strategyId){
    return {type: Type.AddStrategyToClub, clubId, strategyId}
}

export function RemoveStrategyFromClub(clubId, strategyId){
    return {type: Type.RemoveStrategyFromClub, clubId, strategyId}
}



export function LoadClubStrategy(id) {
    return Wait({type: Type.LoadClubStrategy, id});
}

export function LoadClubStrategySuccess(strategy, profits) {
    return UnWait({type: Type.LoadClubStrategySuccess, strategy, profits});
}

export function LoadClubStrategyFailed(id) {
    return UnWait({type: Type.LoadClubStrategyFailed, id});
}

// CARD

export function ToggleClubStrategyCard(card, active) {
    return {type: Type.ToggleClubStrategyCard, card, active};
}

export function UpdateClubStrategyCard(card) {
    return {type: Type.UpdateClubStrategyCard, card};
}

// CHART

export function ToggleClubStrategyChart(id) {
    return {type: Type.ToggleClubStrategyChart, id};
}

export function LoadClubStrategyChart(id, chartId) {
    return Wait({type: Type.LoadClubStrategyChart, id, chartId});
}

export function LoadClubStrategyChartSuccess(id, chart, data) {
    return UnWait({type: Type.LoadClubStrategyChartSuccess, id, chart, data});
}

export function LoadClubStrategyChartFailed(id) {
    return UnWait({type: Type.LoadClubStrategyChartFailed, id});
}



const ClubAction = {
    Type
};

export default ClubAction;