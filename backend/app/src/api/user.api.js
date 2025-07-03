// USER API
import HTTP, {getErrorObj, queryParamsStringfy} from "./http-fetch";

async function getUser() {
    const response = await HTTP.getData('/users/');
    if(response.ok){
        const userJson = await response.json();
        return {'email': userJson.email, 'username': userJson.username,'name': userJson.first_name, 'surname': userJson.last_name};
    } else {
        throw getErrorObj(response, 'Error on load authenticated user');
    }
}

async function searchUser(search) {
    const response = await HTTP.getData('/users/search/'+ queryParamsStringfy({search}))
    if (response.ok){
        const usersJson = await response.json();
        return usersJson;
    }
}

async function searchUsersToShareStrategy(strategyId) {
    const response = await HTTP.getData('/users/search/share/strategy/'+ queryParamsStringfy({strategyId}))
    if (response.ok){
        const usersJson = await response.json();
        return usersJson;
    }
}

const UserAPI = { getUser, searchUser, searchUsersToShareStrategy};

export default UserAPI;
