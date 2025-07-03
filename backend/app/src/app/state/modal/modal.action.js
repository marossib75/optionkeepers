const Type = {
    OpenModal: 'OPEN_MODAL',
    CloseModal: 'CLOSE_MODAL',
}

export function OpenModal({title, props, render, onClose=undefined}) {
    return {type: Type.OpenModal, title, props, render, onClose};
}

export function CloseModal(nextAction) {
    return {type: Type.CloseModal, nextAction};
}

const ModalAction = {
    Type
};

export default ModalAction;
