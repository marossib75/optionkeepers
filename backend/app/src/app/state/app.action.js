const Type = {
    NavigateTo: 'NAVIGATE_TO',
    
    Logout: 'LOGOUT',
    LogoutCompleted: 'LOGOUT_COMPLETED',

    SetAppLoader: 'SET_APP_LOADER',
    HandleAppError: 'HANDLE_APP_ERROR',

    LoadGroups: 'LOAD_GROUPS',
    LoadGroupsSuccess: 'LOAD_GROUPS_SUCCESS',
    LoadGroupsFailed: 'LOAD_GROUPS_FAILED',

    LoadExchanges: 'LOAD_EXCHANGES',
    LoadExchangesSuccess: 'LOAD_EXCHANGES_SUCCESS',
    LoadExchangesFailed: 'LOAD_EXCHANGES_FAILED',
}

export function NavigateTo(path) {
    return { type: Type.NavigateTo, path: path};
}

export function Logout() {
    return {type: Type.Logout};
}

export function LogoutCompleted() {
    return {type: Type.LogoutCompleted};
}

export function SetAppLoader(loading) {
    return {type: Type.SetAppLoader, loading: loading};
}

export function HandleAppError(error, message, silent=false) {
    return {type: Type.HandleAppError, error, message, silent};
}


export function Wait(action) {
    return {wait: 1, ...action};
}

export function UnWait(action) {
    return {wait: -1, ...action};
}

export function LoadGroups() {
    return Wait({type: Type.LoadGroups})
}

export function LoadGroupsSuccess(groups) {
    return UnWait({type: Type.LoadGroupsSuccess, groups})
}

export function LoadGroupsFailed() {
    return UnWait({type: Type.LoadGroupsFailed})
}

export function LoadExchanges() {
    return Wait({type: Type.LoadExchanges})
}

export function LoadExchangesSuccess(exchanges) {
    return UnWait({type: Type.LoadExchangesSuccess, exchanges})
}

export function LoadExchangesFailed() {
    return UnWait({type: Type.LoadExchangesFailed})
}

const AppAction = {
    Type
};

export default AppAction;
