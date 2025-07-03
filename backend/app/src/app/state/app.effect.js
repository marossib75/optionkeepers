import API from "../../api/api";
import { ModalCatalog } from "../enums/modal-catalog.enum";
import { OpenModal } from "./modal/modal.action";
import history from "../utils/history.router";

import AppAction, { HandleAppError, 
    LoadExchangesFailed, LoadExchangesSuccess, 
    LoadGroupsFailed, LoadGroupsSuccess, 
    LogoutCompleted,
    SetAppLoader } from "./app.action";

export function appEffect(action, dispatch) {

    switch (action.type) {

        case AppAction.Type.NavigateTo:
            history.push(action.path)
            break;
        
        case AppAction.Type.Logout:
            dispatch(SetAppLoader(true))
            API.signout()
                .then(() => {
                    console.log("User logged out successfully");
                })
                .catch((err) => {
                    console.log("User logged out with errors");
                    console.log(err);
                }).finally(() => {
                    dispatch(LogoutCompleted());
                    dispatch(SetAppLoader(false));
                    dispatch(OpenModal(ModalCatalog.ErrorMessage("Sorry, we cannot perform your request")));
                });
            break;

        case AppAction.Type.HandleAppError:
            console.log(action.error);
            if (!action.silent) {
                if (action.error.status === 401)
                    dispatch(OpenModal(ModalCatalog.ErrorMessage("Sorry, you are not authenticated")));
                else
                    dispatch(OpenModal(ModalCatalog.ErrorMessage(action.message || "Sorry, we cannot perform your request")));
            }
            break;

        case AppAction.Type.LoadGroups:
            API.getGroups()
            .then((groups) => dispatch(LoadGroupsSuccess(groups)))
            .catch((err) => {
                dispatch(LoadGroupsFailed());
                dispatch(HandleAppError(err));
            })
            break;

        case AppAction.Type.LoadExchanges:
            API.getExchanges()
            .then((exchanges) => dispatch(LoadExchangesSuccess(exchanges)))
            .catch((err) => {
                dispatch(LoadExchangesFailed());
                dispatch(HandleAppError(err));
            })
            break;

        default:
            break;
    }
}
