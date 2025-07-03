import React from "react";

import {MdVpnLock } from "react-icons/md";
import { NavigateTo } from "../../state/app.action";

import "./PrivatePage.css"


function PrivatePage({text, page, dispatch}) {

    return (
        <div className="app-page-private">
            <MdVpnLock style={{width:'100px', height:'100px'}}/>
            <h2>{text}</h2>
            <div>go back to <a href='' onClick={()=> dispatch(NavigateTo("/app/"+page))}>your {page}</a></div>
        </div>
    );
};
export default PrivatePage;
