// MARKETS API
import HTTP, {getErrorObj, queryParamsStringfy} from "./http-fetch";


async function getMarkets(search) {
    const response = await HTTP.getData('/markets/?search='+search);
    if (response.ok) {
        const marketsJson = await response.json();
        return marketsJson;
    } else {
        throw getErrorObj(response, 'Error on load the list of markets');
    }
}

async function getMarket(symbol) {
    const response = await HTTP.getData('/markets/' + symbol + '/');
    if (response.ok) {
        const marketJson = await response.json();
        return marketJson;
    } else {
        throw getErrorObj(response, 'Error on load market info');
    }
}


async function getMarketHistory(symbol) {
    const response = await HTTP.getData('/markets/' + symbol + '/history/');
    if (response.ok) {
        const historyJson = await response.json();
        return historyJson.days.map(day => ({...day, date: day.date ? new Date(day.date) : day.date}));
    } else {
        throw getErrorObj(response, 'Error on load market history');
    }
}

async function getMarketVolatilityHistory(symbol) {
    const response = await HTTP.getData('/markets/' + symbol + '/history/volatility/');
    if (response.ok) {
        const historyJson = await response.json();
        return historyJson.map(day => ({...day, date: day.date ? new Date(day.date) : day.date}));
    } else {
        throw getErrorObj(response, 'Error on load market history volatility');
    }
}

async function getMarketVolatilityPerStrike(symbol, expiration) {
    const response = await HTTP.getData('/markets/' + symbol + '/volatility/' +  queryParamsStringfy({expiration}));
    if (response.ok) {
        const openInterestJson = await response.json();
        return openInterestJson;
    } else {
        throw getErrorObj(response, 'Error on load market history');
    }
}

async function getMarketOpenInterest(symbol, expiration) {
    const response = await HTTP.getData('/markets/' + symbol + '/open-interest/' +  queryParamsStringfy({expiration}));
    if (response.ok) {
        const openInterestJson = await response.json();
        var values = openInterestJson.values.map(value => ({...value, date: value.date ? new Date(value.date) : value.date}));
        var last = values[values.length -1]
        values.unshift({date: new Date()});
        values.push({date: new Date(last.date.getTime() + (60*60*24*1000))})
        return {...openInterestJson, values};
    } else {
        throw getErrorObj(response, 'Error on load market history');
    }
}

async function getMarketFutures(symbol, strategyId) {
    var url = '/markets/' + symbol + '/futures/';

    if (strategyId)
        url = url + '?strategyId=' + strategyId;

    const response = await HTTP.getData(url);
    if (response.ok) {
        const futuresJson = await response.json();
        return futuresJson;
    } else {
        throw getErrorObj(response, 'Error on load market history');
    }
}

const MarketAPI = { getMarkets, getMarket, getMarketHistory, getMarketVolatilityHistory, getMarketVolatilityPerStrike, getMarketOpenInterest, getMarketFutures };

export default MarketAPI;
