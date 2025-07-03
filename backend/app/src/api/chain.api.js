// CHAIN API
import HTTP, {getErrorObj, queryParamsStringfy} from "./http-fetch";


function prepareUrl(symbol, expiration, date) {
    var url = '/chains/' + symbol + '/';

    if (expiration && date)
        url =  url + expiration + '/' + date + '/';

    return url;
}

async function getChain(symbol, expiration, date, strategyId) {
    const response = await HTTP.getData(prepareUrl(symbol, expiration, date)+queryParamsStringfy({strategyId}));
    if (response.ok) {
        const chainJson = await response.json();
        return chainJson;
    } else {
        throw getErrorObj(response, 'Error on load chain options');
    }
}

async function getChainOpenInterest(symbol, expiration, date) {
    const response = await HTTP.getData('/chains/' + symbol + '/' + expiration + '/' + date + '/open-interest/');
    if (response.ok) {
        const chainJson = await response.json();
        return chainJson;
    } else {
        throw getErrorObj(response, 'Error on load chain options');
    }
}

async function getChainOpenInterestCumulative(symbol, expiration, date) {
    const response = await HTTP.getData('/chains/' + symbol + '/' + expiration + '/' + date + '/open-interest/cumulative/');
    if (response.ok) {
        const chainJson = await response.json();
        return chainJson;
    } else {
        throw getErrorObj(response, 'Error on load chain options');
    }
}

async function getChainVolatilityVariation(symbol, expiration, date) {
    const response = await HTTP.getData('/chains/' + symbol + '/' + expiration + '/' + date + '/volatility/variation/');
    if (response.ok) {
        const volVariation = await response.json();
        return volVariation;
    } else {
        throw getErrorObj(response, 'Error on load chain options');
    }
}

const ChainAPI = { getChain, getChainOpenInterest, getChainOpenInterestCumulative, getChainVolatilityVariation };

export default ChainAPI;
