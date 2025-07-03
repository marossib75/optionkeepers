const Type = {
    LoadUser: 'LOAD_USER',
    LoadUserSuccess: 'LOAD_USER_SUCCESS',
    LoadUserFailed: 'LOAD_USER_FAILED',
}

export function LoadUser() {
    return { type: Type.LoadUser };
}

export function LoadUserSuccess(user) {
    return {type: Type.LoadUserSuccess, user: user};
}

export function LoadUserFailed() {
    return {type: Type.LoadUserFailed};
}

const UserAction = {
    Type
};

export default UserAction;
