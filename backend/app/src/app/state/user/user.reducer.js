import UserAction from "./user.action";


const UserState = {
    strategies: [],
    portfolio: {},
};


export function userReducer(state = UserState, action) {

    switch (action.type) {
        case UserAction.Type.LoadUserSuccess:
            return {...state, ...action.user};

        case UserAction.Type.LoadUserFailed:
            return UserState;

        default:
            return state;
    }
}
