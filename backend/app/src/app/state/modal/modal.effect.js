import ModalAction from "./modal.action";

export function modalEffect(action, dispatch) {
    switch (action.type) {
        case ModalAction.Type.CloseModal:
            if (action.nextAction) {
                dispatch(action.nextAction);
            }
            break
        default:
            break;
    }
}
