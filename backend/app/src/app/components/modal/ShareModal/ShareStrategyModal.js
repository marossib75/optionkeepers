import React, { useEffect, useState } from "react";
import {Button, Tab, Tabs} from "react-bootstrap";
import API from "../../../../api/api";
import { ListSearchBar } from "../../../commons/components/inputs/multi-choice-search/MultiChoiceSearch";
import { AddStrategyToClub } from "../../../state/club/club.action";

import "./ShareModal.css";
import { ShareStrategy } from "../../../state/strategy/strategy.action";
import { CloseModal } from "../../../state/modal/modal.action";
import SocialLinkShare from "../SocialLinkShare/SocialLinkShare";

function ShareInApp({strategy, onClose, dispatch}){
    const [usersToShareTo, setUsersToShareTo] = useState("")
    const [shareToUser, setShareToUser] = useState([]);

    useEffect(()=>{
        const getUsers = async () =>{
          const users = await API.searchUsersToShareStrategy(strategy.id);
          setUsersToShareTo(users);
        }
        getUsers().catch(err=> console.log(err));
      }, [])

    return (
        <div>
            <div className="app-share-modal--searchbar">
                <ListSearchBar listInput={usersToShareTo} optLabel={'userId'} optValue={'userId'} setListOutput={setShareToUser}/>
                <div className="app-share-modal--button">
                    <Button onClick={()=> shareToUser.forEach(user => {
                        dispatch(ShareStrategy(strategy.id, user.userId));
                        dispatch(CloseModal(onClose))
                    })}>Share strategy</Button>
                </div>
            </div>
        </div>
    )
}

function ShareToClub({strategy, onClose, dispatch}) {
    const [clubsWhereAdmin, setClubsWhereAdmin] = useState([]);
    const [clubsToShareIn, setClubsToShareIn] = useState([]);

    useEffect(()=>{
        const getClubs = async () =>{
          // get the clubs where i can add my strategies
          const clubs = await API.getClubsWhereAdmin(strategy.id);
          setClubsWhereAdmin(clubs);
        }
        getClubs().catch(err=> console.log(err));
      }, [])

    return(
        <div>
            <div className="app-share-modal--searchbar">
                <ListSearchBar listInput={clubsWhereAdmin} optLabel={'name'} optValue={'id'} setListOutput={setClubsToShareIn}/>
                <div className="app-share-modal--button">
                    <Button onClick={()=> clubsToShareIn.forEach(club => {
                        dispatch(AddStrategyToClub(club.id, strategy._id));
                        dispatch(CloseModal(onClose))
                    })}>Add strategies to club</Button>
                </div>
            </div>
        </div>
    )
}



function ShareStrategyModal({props, dispatch}) {
    let shareUrl = window.location.href;
    if(!shareUrl.includes("strategies/")){
        // modal was not opened from the strategy page, so the url must be recreated
        let basicUrl = shareUrl.split('app')
        shareUrl = basicUrl[0]+'app/strategies/'+props.strategy._id
    }
    const title = 'Check this strategy on PoliOp';

    return(
        <>
            <Tabs defaultActiveKey="ShareInApp" justify>
                <Tab eventKey="ShareInApp" title="Share directly">
                    <ShareInApp strategy={props.strategy} onClose={props.onClose} dispatch={dispatch} />
                </Tab>
                <Tab eventKey="ShareToClub" title="Share to a club">
                    <ShareToClub strategy={props.strategy} onClose={props.onClose} dispatch={dispatch}/>
                </Tab>
                <Tab eventKey="ShareOutsideApp" title="Share link">
                    <SocialLinkShare {...{shareUrl, title}}/>
                </Tab>
            </Tabs>
        </>
    )
}

export default ShareStrategyModal;