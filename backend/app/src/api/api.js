import HTTP from "./http-fetch";

import UserAPI from "./user.api";
import MarketAPI from "./market.api";
import StrategyAPI from "./strategy.api";
import ChartAPI from "./chart.api";
import ChainAPI from "./chain.api";
import UtilAPI from "./util.api";
import PortfolioAPI from "./portfolio.api";
import ClubAPI from "./club.api";

async function signout() {
    return HTTP.postData('/signout/');
}

const API = {...UserAPI, ...UtilAPI, ...MarketAPI, ...ChainAPI, ...StrategyAPI, ...PortfolioAPI,...ChartAPI, ...ClubAPI, signout};

export default API;
