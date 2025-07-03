import { UnWait, Wait } from "../app.action";

const Type = {
    CreatePortfolio: 'CREATE_PORTFOLIO',
    UpdatePortfolio: 'UPDATE_PORTFOLIO',
    DeletePortfolio: 'DELETE_PORTFOLIO',

    LoadPortfolio: 'LOAD_PORTFOLIO',
    LoadPortfolioSuccess: 'LOAD_PORTFOLIO_SUCCESS',
    LoadPortfolioFailed: 'LOAD_PORTFOLIO_FAILED',
    TogglePortfolioStrategy: 'TOGGLE_PORTFOLIO_STRATEGY',
    SetPortfolioPerformanceChart: 'SET_PORTFOLIO_PERFORMANCE_CHART',
}

// PORTFOLIO

export function CreatePortfolio(userId, name) {
    return {type: Type.CreatePortfolio, userId, name};
}

export function UpdatePortfolio(id, strategyId) {
    return {type: Type.UpdatePortfolio, id, strategyId};
}

export function DeletePortfolio(id) {
    return {type: Type.DeletePortfolio, id};
}

export function LoadPortfolio(id) {
    return Wait({type: Type.LoadPortfolio, id});
}

export function LoadPortfolioSuccess(portfolio) {
    return UnWait({type: Type.LoadPortfolioSuccess, portfolio});
}

export function LoadPortfolioFailed(id) {
    return UnWait({type: Type.LoadPortfolioFailed, id});
}

export function TogglePortfolioStrategy(id, strategyId, disabled) {
    return {type: Type.TogglePortfolioStrategy, id, strategyId, disabled}
}

export function SetPortfolioPerformanceChart(id, data) {
    return {type: Type.SetPortfolioPerformanceChart, id, data};
}



const PortfolioAction = {
    Type
};

export default PortfolioAction;
