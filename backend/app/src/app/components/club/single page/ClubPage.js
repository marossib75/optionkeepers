import React, { useEffect, useState } from "react";
import { Button, Col, Container, Image, Nav, Navbar, Form, Row } from "react-bootstrap";
import { MdArrowBack, MdPublic, MdSettingsApplications, MdSort } from "react-icons/md";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import { AddMemberClub, CloseClub, LoadClubPage, RemoveMemberCLub, UpvoteClub } from "../../../state/club/club.action";

// didn't build on server by importing logo from static folder, so logo has been copied and moved
import logo_copy from "../../../commons/components/club/logo_copy.png"

import { AiFillCloseSquare } from "react-icons/ai";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { BsBookmark, BsFillPersonFill, BsList, BsPeople } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa";
import { FcSettings } from "react-icons/fc";
import { ImExit } from "react-icons/im";
import { TiArrowUpOutline, TiArrowUpThick } from "react-icons/ti";
import { Link } from "react-router-dom";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";
import AnimatedButton from "../../../commons/components/buttons/button-upvote-animated/AnimatedUpvoteButton";
import CustomDropdown from "../../../commons/components/dropdown/dropdown-custom-icon";
import { InteractionType } from "../../../enums/interaction-catalog.enum";
import { ModalCatalog } from "../../../enums/modal-catalog.enum";
import { OpenModal } from "../../../state/modal/modal.action";
import PrivatePage from "../../private page/PrivatePage";
import "./ClubPage.css";
import Settings from "./ClubSettings";
import ClubStrategiesManagement from "./ClubStrategies/ClubStrategies";
import ClubStrategiesCards from "./ClubStrategies/ClubStrategiesCards/ClubStrategiesCards";
import { RiShareForwardFill } from "react-icons/ri";


function ClubActionButtons ({page}) {

    return(
        <Link to='/app/clubs'> 
            <ButtonIcon theme='dark' fontSize={18} onClick={()=>{}}>
                <MdArrowBack/>
                {`${page}`}
            </ButtonIcon>
        </Link>
    )
}

function ClubInfoSidebar ({club, dispatch, username}) {

    const[upvoted, setUpvoted] = useState();
    //check if already upvoted
    useEffect(()=> setUpvoted(club.upvotes.filter(u=>u===username).length>0), [club.upvotes.length])

    return(
        <>
            <div><Image className="app-club-page--logo" src={logo_copy} roundedCircle/></div>
            <div><h5>{club.name}</h5></div>
            <div className="app-club-page--info">
                Created by: <br/><strong>{username==club.creator_userId? <div><BsFillPersonFill/> You</div> : club.creator_userId}</strong>
            </div>
            {  club.creator_userId == username &&  
                <div className="app-club-page--info">
                    Public: {club.published ? 
                                <MdPublic style={{color:'green'}}/> 
                                : 
                                <MdPublic style={{color:'darkred'}}/>
                            }
                </div>
            }
            <div className="app-club-page--info">
                Upvotes: 
                <div className="app-club-page--upvote">
                    <div className="app-club-card--bold">
                        {club.upvotes.length}
                    </div>
                    <div style={{position: 'relative'}}>
                    <AnimatedButton 
                        isUpvoted={upvoted} 
                        iconFill={TiArrowUpThick}
                        iconOutline={TiArrowUpOutline}
                        upvote={()=> dispatch(UpvoteClub(club.id, InteractionType.Vote))} 
                        downvote={()=>dispatch(UpvoteClub(club.id, InteractionType.Unvote))}
                    />
                    </div>
                </div>
            </div>
            <div className="app-club-page--info">Active since: <br/> {club.created}</div>
            {club.description!== '' && <div className="app-club-page--info">Description: <br/>{club.description}</div>}
            {club.links.length>0 &&
                <div className="app-club-page--info">Social: 
                    <div className="app-club-page--links">
                        { club.links.map(s => 
                            <a key={s.title} href={s.url} style={{marginTop:'4px'}}>
                                {s.title}
                            </a>)
                        }
                    </div>
                </div>
            }
        </>
    )
}

function checkAdminLeaving (username, clubId, admins, members, dispatch) {
    if(admins.length===1){
        if(members-admins.length!=0){
            // need to promote someone before leaving
            dispatch(OpenModal(ModalCatalog.ErrorMessage(
                "Attention!"+'\n'+
                'You are the last admin and there are still members.'+'\n'+
                'Either promote a member to admin or expel everyone.'+'\n'+
                'If you choose to expel everyone and leave, the club will be closed.'
                )))
        } else{
            // 1 admin and no members => admin leaves and club is closed
            dispatch(RemoveMemberCLub(username, clubId))
            dispatch(CloseClub(clubId))
        }
    } else {
        dispatch(RemoveMemberCLub(username, clubId))
    }
}

function ActionsNavbar ({ dispatch, searchText, setSearchText, sortBy, setSortBy, sort, setShowSettings, isUserAdmin, isUserMember, club, username}) {
    const {_id, members, admins, members_list, published} = club;
    const isCreator = username == club.creator_userId

    
    const dropdownItemsSort = [
        {   display: sort.new, 
            onClick: () => setSortBy(sort.new), 
            icon: <BiSortDown className="mr-3" size={18} />,
            active: sortBy== sort.new,
        },
        {   display: sort.old, 
            onClick: () => setSortBy(sort.old), 
            icon: <BiSortUp className="mr-3" size={18} />,
            active: sortBy== sort.old,
        },
        {   display: sort.upvotes, 
            onClick: () =>setSortBy(sort.upvotes), 
            icon: <TiArrowUpOutline className="mr-3" size={18} />,
            active: sortBy== sort.upvotes
        },
        {   display: sort.bookmark, 
            onClick: () => setSortBy(sort.bookmark), 
            icon: <BsBookmark className="mr-3" size={18} />,
            active: sortBy== sort.bookmark
        },
        
    ];

    const dropdownItems = [
        isUserAdmin &&
        {   display: "Manage members", 
            onClick: ()=> setShowSettings(true), 
            icon: <FaUserCog className="mr-3" size={18} />,
            
        },
        isUserAdmin &&
        {   display: "Modify club", 
            onClick: () => dispatch(OpenModal(ModalCatalog.UpdateClubSettings(club, isCreator))), 
            icon: <MdSettingsApplications className="mr-3" size={18} />,
        },
        !(isUserAdmin && admins.length==1 && members-admins.length==0) &&
        {   display: "Leave club", 
            onClick: () => isUserAdmin? 
                                checkAdminLeaving(username, _id, admins, members, dispatch)
                              : dispatch(OpenModal(ModalCatalog.LeaveClub(username, _id))), 
            icon: <ImExit className="mr-3" size={18} />,
            type: 'delete'
        },
        isUserAdmin && members-admins.length==0 && admins.length==1 &&
        {   display: "Close club", 
            onClick: () => dispatch(OpenModal(ModalCatalog.CloseClub(_id))), 
            icon: <AiFillCloseSquare className="mr-3" size={18} />,
            type: 'delete'
        },
        
    ].filter(Boolean)

    return(
        <Navbar expand="lg" className="app-club--action-navbar">

                <div>Sort by: <strong className="ml-1 mr-2">{sortBy}</strong></div>
                <CustomDropdown toggle={<MdSort size={18}/>} dropdownItems={dropdownItemsSort}/>

                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto app-club--action-navbar">
                        <Form.Control
                            className="mr-5"
                            type="text"
                            value={searchText || ""}
                            placeholder="Search strategy"
                            onChange={event => setSearchText(event.target.value)}
                        />
                        {published &&
                            <ButtonIcon 
                                style={{marginRight:'1em'}}
                                active={true} 
                                theme="dark" 
                                fontSize={18} 
                                onClick={() => dispatch(OpenModal(ModalCatalog.ShareClub(club)))}
                            >
                                <RiShareForwardFill/>
                            </ButtonIcon>
                        }
                        {members_list.includes(username) ?
                            <CustomDropdown toggle={<FcSettings size={20}/>} {...{dropdownItems}}/>
                            :
                            <Button variant="success" onClick={()=> dispatch(AddMemberClub(username, _id))}>Join club!</Button>
                        }
                    </Nav>
                </Navbar.Collapse>
        </Navbar>
    )
}

function MemberList ({club}) {
    const {admins, members_list} = club;
    // members also include admins
    return(
        <div style={{marginLeft:'auto', marginTop:'1em', maxHeight: '100%', overflowY:'auto', fontSize: '14px', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div>admins - {admins.length}</div>
            <ul style={{marginTop: '0.2em'}}>{admins.map(a=><li key={a}>{a}</li>)}</ul>
            <div style={{marginTop: '0.5em'}}>members - {members_list.filter(m=>!admins.includes(m)).length}</div>
            <ul style={{marginTop: '0.2em'}}>{members_list.filter(m=>!admins.includes(m)).map(m=><li key={m}>{m}</li>)}</ul> 
        </div>
    )
}

function ConnectedClubPage({club, username, page, dispatch}) {
    const {admins, members_list, members, published} = club

    const [showSettings, setShowSettings] = useState(false);

    const[searchText, setSearchText] = useState("");

    const [isUserAdmin, setIsUserAdmin] = useState();
    const [isUserMember, setIsUserMember] = useState();

    const sort = {
        new: "New first",
        old: "Old first",
        upvotes: "Most upvoted",
        bookmark: "Most saved",
    }

    const [sortBy, setSortBy] = useState(sort.new)

    const location = useLocation();
    let creatorFromUrl = location.pathname.split('/')[3].replace(/-/g," ")
    let clubNameFromUrl = location.pathname.split('/')[4].replace(/-/g," ")

    useEffect(()=> {  dispatch(LoadClubPage(creatorFromUrl, clubNameFromUrl))  }, []);

    useEffect(()=> setIsUserMember(members_list.filter(u => !admins.includes(u)).includes(username)), [JSON.stringify(members_list)]);
    useEffect(()=> setIsUserAdmin(admins.includes(username)), [JSON.stringify(admins)])

    return (
        <Container fluid style={{overflow:'scroll'}}>
            {(isUserMember || isUserAdmin) || published ?
                <Row className="app-club-page">
                    <Col lg={2} className="app-club-page--leftsidebar">
                        {!showSettings && <ClubActionButtons {...{page}}/>}
                        <ClubInfoSidebar {...{club, dispatch, username}} />
                    </Col>
                    { !showSettings ?
                    <>
                        <Col lg={8}>
                        <ActionsNavbar {...{searchText, setSearchText, sortBy, setSortBy, sort, setShowSettings, isUserAdmin, isUserMember, club, dispatch, username}}/>
                            <Row style={{flexWrap:'nowrap'}}>
                                <ClubStrategiesManagement {...{searchText, sortBy, sort}}/>
                                <ClubStrategiesCards/>
                            </Row>
                        </Col>
                        <Col lg={2} style={{ paddingLeft: 0, paddingRight: 0, marginLeft: 'auto'}}>
                            <MemberList club={club}/>
                        </Col>
                    </>
                    :
                        <Settings club={club} dispatch={dispatch} username={username} setShowSettings={setShowSettings}/>
                    }
                </Row>
                :
                <PrivatePage text={'This club is private'} page={'clubs'} dispatch={dispatch}/>
            }
        </Container>
    );
};

const mapStateToProps = (state) => {
    return {club: state.clubs.club, username: state.user.username, page: state.clubs.page, wait: state.app.wait};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const ClubPage = connect(mapStateToProps, mapDispatchToProps)(ConnectedClubPage)

export default ClubPage;
