import React, {useState } from "react";
import {Button, Tab, Tabs} from "react-bootstrap";
import API from "../../../../api/api";

import "./ShareModal.css";
import { CloseModal } from "../../../state/modal/modal.action";
import SocialLinkShare from "../SocialLinkShare/SocialLinkShare";
import { AsyncSearchBar } from "../../../commons/components/inputs/multi-choice-search/MultiChoiceSearch";
import { AddMemberClub } from "../../../state/club/club.action";

function Invite({members, clubId, onClose, dispatch}){
    const [search, setSearch] = useState("");
    const [usersToAdd, setUsersToAdd] = useState([]);

    const searchFunc = async () =>{
        const users = await API.searchUser(search)
        // remove users that are already members
        return users.filter(user => !members.includes(user.username))
    }

    return (
        <div>
            <div className="app-share-modal--searchbar">
                <AsyncSearchBar setListToAdd={setUsersToAdd} setSearch={setSearch} searchFunc={searchFunc} optLabel={'username'} optValue={'email'}/>
                <div className="app-share-modal--button">
                    <Button disabled={usersToAdd.length==0} onClick={()=> {
                        usersToAdd.forEach((usr) => dispatch(AddMemberClub(usr.username, clubId))); 
                        dispatch(CloseModal(onClose))}}
                    >Invite</Button>
                </div>
            </div>
        </div>
    )
}



function ShareClubModal({props, dispatch}) {
    let shareUrl = window.location.href;
    const title = 'Check out this club on PoliOp';

    return(
        <>
            <Tabs defaultActiveKey="Invite" justify>
                <Tab eventKey="Invite" title="Invite">
                    <Invite members={props.members} clubId={props.clubId} onClose={props.onClose} dispatch={dispatch} />
                </Tab>
                <Tab eventKey="ShareOutsideApp" title="Share link">
                    <SocialLinkShare {...{shareUrl, title}}/>
                </Tab>
            </Tabs>
        </>
    )
}

export default ShareClubModal;