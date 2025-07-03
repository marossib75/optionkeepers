// USER API
import HTTP, {getErrorObj} from "./http-fetch";

async function getGroups() {
    const response = await HTTP.getData('/utils/groups/')
    if (response.ok) {
        const groupsJson = await response.json();
        return groupsJson.map(group => ({...group, id: group._id}));
    } else {
        throw getErrorObj(response, 'Error on load groups');
    }
}

async function getExchanges() {
    const response = await HTTP.getData('/utils/exchanges/')
    if (response.ok) {
        const exchangesJson = await response.json();
        return exchangesJson.map(exchange => ({...exchange, id: exchange._id}));
    } else {
        throw getErrorObj(response, 'Error on load exchanges');
    }
}

const UtilAPI = { getGroups, getExchanges };

export default UtilAPI;
