import React from "react";
import { Card, Image, Row } from "react-bootstrap";
import { BiUpvote } from "react-icons/bi";
import { MdPublic } from "react-icons/md";
import { connect } from "react-redux";

// didn't build on server by importing logo from static folder, so logo has been copied and moved
import logo_copy from "../../../commons/components/club/logo_copy.png"

import { ClubPageType } from "../../../enums/club-page.enum";
import {Link} from "react-router-dom"
import "./ClubCard.css"
import { BsFillPersonFill } from "react-icons/bs";

function PersonalFooter({published, upvotes}){
    return(
        <div className="app-club-card-footer">
            <div className="app-club-card-footer--upvotes">
                <div className="app-club-card--bold">{upvotes}</div>
                <div>
                    <BiUpvote 
                        className="app-club-card--margleft app-club-card--icon" 
                        style={{marginBottom:'3px', width:'18px', height:'18px'}}/>
                </div> 
            </div>
                <div>
                    Public:
                    {published ? 
                        <MdPublic className="app-club-card--margleft app-club-card--icon" style={{color:'green'}}/> 
                        : 
                        <MdPublic className="app-club-card--margleft app-club-card--icon" style={{color:'darkred'}}/>}
                </div>
        </div>
    )
}

function ExploreFooter({upvotes}){
    return(
        <div className="app-club-card-footer">
            <div className="app-club-card-footer--upvotes">
                <div className="app-club-card--bold">{upvotes}</div>
                <div><BiUpvote className="app-club-card--margleft app-club-card--icon"/></div>
            </div>
        </div>
    )
}

function removeSpaces(name) {
    return name.replace(/ /g,"-");
}

function ConnectedClubCard({club, page, username}){
    const {creator_userId, name, members, nstrategies, description, created, published, upvotes} = club;

    return(
        <Link to={{
            pathname: `/app/clubs/${removeSpaces(creator_userId)}/${removeSpaces(name)}`,
            // state: club.id
          }} style={{textDecoration: 'none', color: 'black'}}>
            <Card className="app-club-card hover-scaleup">
                <Card.Body>
                    <div style={{display:'flex'}}>
                        <Image style={{width: '50px', height:'50px', marginRight:'10px'}} src={logo_copy} roundedCircle/>
                        <div style={{alignItems: 'center', overflow: 'hidden'}}>
                            <div><strong>{name}</strong></div>
                            <div style={{fontSize:'0.8rem'}}>{creator_userId==username? <div><BsFillPersonFill style={{marginBottom:'1px'}}/> You</div> : creator_userId}</div>
                        </div>
                    </div>

                    <div className="app-club-card--info">
                        <div className="app-club-card--bold">Partecipants:</div> 
                        <div className="app-club-card--stats">{members}</div> 
                    </div>
                    <div className="app-club-card--info">
                            <div className="app-club-card--bold">Strategies:</div>
                            <div className="app-club-card--stats">{nstrategies}</div> 
                    </div>
                    {description !== '' &&
                        <div>
                            <div className="app-club-card--bold">Description: </div> 
                            <div className="app-club-card--description">{description}</div>
                        </div>
                    }
                    {
                        page === ClubPageType.Personal ?
                        <PersonalFooter published={published} upvotes={upvotes.length}/>
                        :
                        <ExploreFooter  upvotes={upvotes.length}/>
                    }
                </Card.Body>
            </Card>
        </Link>
    )
}

const mapStateToProps = ({ clubs, user }) => {
    return {page: clubs.page, username: user.username};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const ClubCard = connect(mapStateToProps, mapDispatchToProps)(ConnectedClubCard)

export default ClubCard;