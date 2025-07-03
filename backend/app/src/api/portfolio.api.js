// STRATEGY API
import HTTP, {getErrorObj} from "./http-fetch";


async function getPortfolio(id) {
    const response = await HTTP.getData('/users/portfolio/')
    if (response.ok) {
        const portfolioJson = await response.json();
        return {...portfolioJson, id: portfolioJson._id};
    } else {
        throw getErrorObj(response, 'Error on load user portfolio');
    }
}

async function createPortfolio(uderId, name) {
    return HTTP.postData('/users/portfolio/', {uderId, name});
}

async function updatePortfolio(id, strategyId) {
    return HTTP.postData('/users/portfolio/'+ id + '/', {strategyId});
}

async function deletePortfolio(id) {
    return HTTP.deleteData('/users/portfolio/'+ id + '/');
}

const PortfolioAPI = { 
    getPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
};

export default PortfolioAPI;
