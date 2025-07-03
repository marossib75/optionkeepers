import { ClubPageType } from "../app/enums/club-page.enum";
import HTTP, {getErrorObj, queryParamsStringfy} from "./http-fetch";

async function getClubs(pageType, search, paginationPage, sortField, sortOrder) {
    let response = undefined;
    switch (pageType){
        case ClubPageType.Personal:
            response =  await HTTP.getData('/users/clubs/'+queryParamsStringfy({search, paginationPage, sortField, sortOrder}))
            break;
        case ClubPageType.Joined:
            response = await HTTP.getData('/users/clubs/joined/'+queryParamsStringfy({search, paginationPage, sortField, sortOrder}))
            break;
        case ClubPageType.Explore:
            response = await HTTP.getData('/users/clubs/explore/'+queryParamsStringfy({search, paginationPage, sortField, sortOrder}))
            break;
        default:
            break;
    }
    if (response.ok) {
        const clubsJson = await response.json();
        return {...clubsJson, "data": clubsJson.data.map(club => ({...club, id: club._id}))};
    } else {
        throw getErrorObj(response, `Error on load ${pageType} clubs`);
    }
}

async function getMyClubNames() {
    const response = await HTTP.getData('/users/clubs/names/')
    if (response.ok) {
        const myclubsJson = await response.json();
        return myclubsJson.map(club => club.name);
    } else {
        throw getErrorObj(response, 'Error on load user club names');
    }
}

async function getClubsWhereAdmin(strategyId) {
    const response = await HTTP.getData('/users/clubs/admin/administrate/'+queryParamsStringfy({strategyId}))
    if (response.ok) {
        const clubsWhereAdminJson = await response.json();
        return clubsWhereAdminJson.map(club => ({...club, id: club._id}));
    } else {
        throw getErrorObj(response, 'Error on load clubs where user is admin ');
    }
}

async function getClub(id) {
    const response = await HTTP.getData('/users/clubs/'+id+'/')
    if (response.ok) {
        const clubJson = await response.json();
        clubJson.strategies.forEach(s => s.id = s._id)
        return {...clubJson, id: clubJson._id};
    } else {
        throw getErrorObj(response, 'Error on load user club');
    }
}

async function getClubPage(creator_userId, name) {
    const response = await HTTP.getData('/users/clubs/'+creator_userId+'/'+name+'/')
    if (response.ok) {
        const clubJson = await response.json();
        clubJson.strategies.forEach(s => s.id = s._id)
        return {...clubJson, id: clubJson._id};
    } else {
        throw getErrorObj(response, 'Error on load user club page');
    }
}

async function updateClubUpvote(clubId, voteType){
    return HTTP.postData('/users/clubs/'+clubId+'/upvote/', {voteType});
}

async function createClub(name, published, description, img_path, linksJson) {
    //console.log(JSON.stringify({name, published, description, img_path, linksJson}))
    const links = JSON.parse(linksJson)
    // console.log(linksJson)
    //console.log(links)
    return HTTP.postData('/users/clubs/', {name, published, description, img_path, links});
}

async function updateClubSettings(id, name, published, description, img_path, linksJson) {
    const links = JSON.parse(linksJson)
    return HTTP.postData('/users/clubs/'+id+'/', {id, name, published, description, img_path, links});
}

async function addMemberClub(username, clubId) {
    return HTTP.postData('/users/clubs/'+clubId+'/member/'+username+'/')
}

async function removeMemberClub(username, clubId) {
    return HTTP.deleteData('/users/clubs/'+clubId+'/member/'+username+'/')
}

async function promoteToAdmin(clubId, username){
    return HTTP.postData('/users/clubs/'+clubId+'/admin/'+username+'/')
}

async function demoteAdmin(clubId, username){
    return HTTP.deleteData('/users/clubs/'+clubId+'/admin/'+username+'/')
}

async function addStrategyToClub(clubId, strategyId){
    return HTTP.postData('/users/clubs/'+clubId+'/strategies/'+strategyId+'/')
}

async function removeStrategyFromClub(clubId, strategyId){
    return HTTP.deleteData('/users/clubs/'+clubId+'/strategies/'+strategyId+'/')
}

 async function closeClub(id) {
     return HTTP.deleteData('/users/clubs/'+id+'/');
 }

const ClubAPI = { 
    getClubs,
    getClub, getClubPage,  
    getMyClubNames, getClubsWhereAdmin,
    updateClubUpvote,
    createClub, closeClub, updateClubSettings,
    addStrategyToClub, removeStrategyFromClub,
    addMemberClub, removeMemberClub, 
    demoteAdmin, promoteToAdmin, 
};

export default ClubAPI;