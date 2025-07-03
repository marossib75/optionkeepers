import ModalAction from "./modal.action";

const ModalState = {
    show: false,
    title: '',
    props: undefined,
    render: undefined,
    onShow: undefined,
    onHide: undefined,
}

export function modalReducer(state = ModalState, action) {
    switch(action.type) {

        case ModalAction.Type.OpenModal:
            return {
                ...state, 
                show: true, 
                title: action.title, 
                props: action.props, 
                render: action.render,
                onHide: action.onHide,
                onShow: action.onShow,
            };
    
        case ModalAction.Type.CloseModal:
            return {...state, show: false};

        default:
            return state;
    }
}