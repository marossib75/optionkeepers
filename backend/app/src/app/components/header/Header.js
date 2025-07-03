import React from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import { Popover } from "react-bootstrap";
import { AiOutlineLogout, MdAccountCircle } from "react-icons/all";

import ButtonIcon from "../../commons/components/buttons/button-icon/ButtonIcon";
import ButtonOverlay from "../../commons/components/buttons/button-overlay/ButtonOverlay";

import { Logout, NavigateTo } from "../../state/app.action";

import { AppMode } from "../../enums/app-mode.enum";

import "./Header.css";

const mapStateToProps = state => {
    return { user: state.user, mode: state.app.mode, wait: state.app.wait};
  };

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

function ConnectedHeader({user, mode, dispatch, title = ""}) {
    const location = useLocation();
    const path = location.pathname;
    return (
        <div className="app-header bg-primary">
            <div className="app-header--title text-white" onClick={() => dispatch(NavigateTo("/app/"))}>
                {title}
            </div>
            {
                mode === AppMode.Authenticated &&
                <>
                <div className="app-header--actions">
                    <div className="app-header--action">
                        <ButtonIcon label="Markets"
                                    active={path==="/markets" && wait == 0 }
                                    onClick={() => dispatch(NavigateTo("/app/markets"))}/>
                    </div>
                    <div className="app-header--action">
                        <ButtonIcon label="Strategies"
                                    active={path==="/strategies" && wait == 0}
                                    onClick={() => dispatch(NavigateTo("/app/strategies"))}/>
                    </div>
                    <div className="app-header--action">
                        <ButtonIcon label="Portfolio" active={path==="/portfolio" && wait == 0}
                                    onClick={() => dispatch(NavigateTo("/app/portfolio"))}/>
                    </div>
                    <div className="app-header--action">
                        <ButtonIcon label="Clubs" active={path==="/clubs" && wait == 0}
                                    onClick={() => dispatch(NavigateTo("/app/clubs"))}/> 
                    </div>
                </div>
                <div className="app-header--container">
                    <ButtonOverlay
                        placement="bottom"
                        overlay={
                            <Popover id="popover-positioned-bottom">
                                <Popover.Title as="h3">Hi, {user.name} {user.surname}</Popover.Title>
                                <Popover.Content>
                                    Your email is {user.email}
                                </Popover.Content>
                            </Popover>
                        }>
                        <ButtonIcon check={true}>
                            <MdAccountCircle/>
                        </ButtonIcon>
                    </ButtonOverlay>

                    <ButtonIcon onClick = {() => dispatch(Logout())}>
                        <AiOutlineLogout/>
                    </ButtonIcon>
                </div>
                </>
            }
        
        </div>
    );
};

const Header = connect(mapStateToProps, mapDispatchToProps)(ConnectedHeader)

export default Header;
