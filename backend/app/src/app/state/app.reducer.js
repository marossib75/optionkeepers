import { AppMode } from "../enums/app-mode.enum";
import AppAction from "./app.action";


export const LoadingState = {
    open: false,
    loading: false,
    failed: false,
}

export const SearchState = {
    search: '',
    results: [],
}

export const ChartState = {
    ...LoadingState,
    id: null,
    label: null,
    params: {},
    items: [],
}


const AppState = {
    mode: AppMode.Authenticated,
    wait: 0,
    ...LoadingState,
};


export function appReducer(state = AppState, action) {

    state.wait += action.wait || 0;
    state.wait = state.wait < 0 ? 0 : state.wait;

    switch (action.type) {

        case AppAction.Type.Logout:
            return  {...state, mode: AppMode.NotAuthenticated};

        case AppAction.Type.SetAppLoader:
            return {...state, loading: action.loading};

        case AppAction.Type.LoadGroups:
        case AppAction.Type.LoadExchanges:
            return {...state, failed: false};

        case AppAction.Type.LoadGroupsSuccess:
            return {...state, groups: action.groups};

        case AppAction.Type.LoadExchangesSuccess:
            return {...state, exchanges: action.exchanges};

        case AppAction.Type.LoadGroupsFailed:
        case AppAction.Type.LoadExchangesFailed:
            return {...state, failed: true};

        default:
            return {...state};
    }
}
