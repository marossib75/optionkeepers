import API from "../../../api/api";

import { SetAppLoader, Logout } from "../app.action";
import UserAction, { LoadUserFailed, LoadUserSuccess } from "./user.action";

export function userEffect(action, dispatch) {

    switch (action.type) {
    
        case UserAction.Type.LoadUser:
            dispatch(SetAppLoader(true));
            API.getUser()
                .then((user) => {
                    dispatch(LoadUserSuccess(user));
                })
                .catch((err) => {
                    dispatch(LoadUserFailed());
                    dispatch(Logout());
                })
                .finally(() =>
                    setTimeout(()=> dispatch(SetAppLoader(false)), 300)
                );
            break;
        
        default:
            break;
    }
}
