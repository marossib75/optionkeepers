import API from "../../../api/api";
import { StrategyChartCatalog } from "../../enums/chart-catalog.enum";
import { ClubPageType } from "../../enums/club-page.enum";

import { HandleAppError, NavigateTo, SetAppLoader } from "../app.action";
import ClubAction, 
{LoadClubs, LoadClubPage, LoadClubsSuccess, LoadClubsFailed, 
    LoadClubSuccess, LoadClubFailed, 
    AddMemberClub, CloseClub, LoadClub, LoadClubStrategyChartSuccess, LoadClubStrategyChartFailed, LoadClubStrategyChart, LoadClubStrategyFailed, LoadClubStrategySuccess  } from "./club.action";


export function clubsEffect(action, dispatch) {

    switch (action.type) {
    
        case ClubAction.Type.LoadClubs:
            dispatch(SetAppLoader(true))
            API.getClubs(action.pageType, action.search, action.paginationPage, action.sortField, action.sortOrder)
                .then((paginatedClubs) => {
                    dispatch(LoadClubsSuccess(paginatedClubs));
                })
                .catch((err) => {
                    dispatch(LoadClubsFailed());
                    dispatch(HandleAppError(err));
                })
                .finally(() => dispatch(SetAppLoader(false)));
            break;
        
        case ClubAction.Type.CreateClub:
            API.createClub(action.name, action.published, action.description, action.img_path, action.links)
            .then(() => dispatch(LoadClubs(ClubPageType.Personal, '', 1)))
            .catch((err) => dispatch(HandleAppError(err)));
            break; 

        case ClubAction.Type.UpdateClubSettings:
            API.updateClubSettings(action.id, action.name, action.published, action.description, action.img_path, action.links)
            .then(()=> dispatch(LoadClub(action.id)))
            .catch((err) => dispatch(HandleAppError(err)));
            break; 

        case ClubAction.Type.LoadClub:
            dispatch(SetAppLoader(true))
            API.getClub(action.id)
            .then((club) => { dispatch(LoadClubSuccess(club))} )
            .catch((err) => {
                dispatch(LoadClubFailed(action.id));
                dispatch(HandleAppError(err));
            })
            .finally(() => dispatch(SetAppLoader(false)));
            break;

        case ClubAction.Type.LoadClubStrategy:
            API.getStrategy(action.id)
            .then((strategy)=> {
                dispatch(LoadClubStrategySuccess(strategy, []));
                dispatch(LoadClubStrategyChart(action.id, 0))
            })
            .catch((err) => {
                dispatch(LoadClubStrategyFailed(action.id));
                dispatch(HandleAppError(err));
            });
            break;

        case ClubAction.Type.LoadClubPage:
            dispatch(SetAppLoader(true))
            API.getClubPage(action.creator_userId, action.name)
            .then((club) => { dispatch(LoadClubSuccess(club))} )
            .catch((err) => {
                dispatch(LoadClubFailed(action.name));
                dispatch(HandleAppError(err));
            })
            .finally(() => dispatch(SetAppLoader(false)));
            break;
        
        case ClubAction.Type.UpvoteClub:
            API.updateClubUpvote(action.clubId, action.voteType)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case ClubAction.Type.AddMemberClub:
            API.addMemberClub(action.username, action.clubId)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;
        
        case ClubAction.Type.RemoveMemberCLub:
            API.removeMemberClub(action.username, action.clubId)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case ClubAction.Type.PromoteToAdmin:
            API.promoteToAdmin(action.clubId, action.username)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case ClubAction.Type.DemoteAdmin:
            API.demoteAdmin(action.clubId, action.username)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case ClubAction.Type.AddStrategyToClub:
            API.addStrategyToClub(action.clubId, action.strategyId)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;
        
        case ClubAction.Type.RemoveStrategyFromClub:
            API.removeStrategyFromClub(action.clubId, action.strategyId)
            .then(()=> dispatch(LoadClub(action.clubId)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;
        
        case ClubAction.Type.CloseClub:
            API.closeClub(action.id)
            .then(()=> dispatch(NavigateTo(`/app/clubs/`)))
            .catch((err) => dispatch(HandleAppError(err)));
            break;

        case ClubAction.Type.LoadClubStrategyChart:
            var chart = action.chartId < StrategyChartCatalog.length ? StrategyChartCatalog[action.chartId] : StrategyChartCatalog[0];
            var params = {strategyId: action.id, chartId: action.chartId};
            if (chart && chart.checkRequisits(params)) {
                API.getChart(chart, params)
                    .then((data) => {
                        dispatch(LoadClubStrategyChartSuccess(action.id, chart, chart.getData(data)));
                    })
                    .catch((err) => {
                        dispatch(LoadClubStrategyChartFailed(action.id));
                        dispatch(HandleAppError(err));
                    });
            } else {
                setTimeout(() => {
                    dispatch(LoadClubStrategyChartSuccess(chart, {params:{}, items: []}));
                }, 300);
            } 

        default:
            break;
    }
}
