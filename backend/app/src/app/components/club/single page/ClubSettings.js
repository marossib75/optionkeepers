import React, {useEffect, useState} from "react";
import { Button, Row, Col, Form, Dropdown, InputGroup } from "react-bootstrap";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BiArrowToBottom, BiArrowToTop, BiExit } from "react-icons/bi";
import { GrUserSettings } from "react-icons/gr";
import { MdArrowBack } from "react-icons/md";
import { RiUserAddLine, RiUserSearchLine } from "react-icons/ri";
import API from "../../../../api/api";
import ButtonElement from "../../../commons/components/buttons/button-element/ButtonElement.js/ButtonElement";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";
import CustomDropdown from "../../../commons/components/dropdown/dropdown-custom-icon";
import {AsyncSearchBar} from "../../../commons/components/inputs/multi-choice-search/MultiChoiceSearch";
import { AddMemberClub, DemoteAdmin, PromoteToAdmin, RemoveMemberCLub } from "../../../state/club/club.action";

function Settings ({club, username, setShowSettings, dispatch}) {
    const {_id, admins, members_list} = club;

    const [disableExpelAll, setDisableExpelAll] = useState(false);
    useEffect(()=> setDisableExpelAll(members_list.length - admins.length>0 ? false: true), [members_list.length - admins.length])

    const [showSearch, setShowSearch] = useState(false)

    const [search, setSearch] = useState("");
    const [usersToAdd, setUsersToAdd] = useState("");

    const [filterUser, setFilterUser] = useState("");

    const [showDropdownToggle, setShowDropdownToggle] = useState(false)

    const searchFunc = async () =>{
        const users = await API.searchUser(search)
        // remove users that are already members
        return users.filter(user => !members_list.includes(user.username))
    }


    return(
        <Col>
            <ButtonIcon theme='dark' fontSize={18} onClick={()=>setShowSettings(false)}>
                <MdArrowBack/>
                Back
            </ButtonIcon>
            <div style={{margin:'3em'}}>
                <Row style={{display:'flex', alignItems:'center', marginTop:'2em'}}>
                    <h4>Admins - {admins.length}</h4>
                </Row>
                    <hr/>
                    <div style={{display:'flex', flexWrap: 'wrap'}}>
                    {
                        admins.map( a =>{
                            if(a != username) 
                                return <ButtonElement 
                                            key={a}
                                            text={a} 
                                            onMouseEnter={() => setShowDropdownToggle(true)}
                                            onMouseLeave={() => setShowDropdownToggle(false)}
                                        >
                                            <CustomDropdown {...{showDropdownToggle, dropdownItems:[
                                                { display: "Demote", onClick: ()=> dispatch(DemoteAdmin(_id, a)), icon: <BiArrowToBottom className="mr-3" size={16} />, type: 'delete' },
                                            ]}}/>
                                        </ButtonElement>
                            else return <ButtonElement key={a} text={a} />
                        })
                    }
                    </div>
            </div>
            <div style={{margin:'3em'}}>
                <Row style={{display:'flex', alignItems:'center', marginTop:'2em'}}>
                    
                    <h4 style={{alignItems:'center'}}>Members - {members_list.length - admins.length}</h4>

                    <ButtonIcon
                        onClick={()=> setShowSearch(!showSearch)}
                        label='Add members'
                        theme='dark'
                        fontSize={25}
                        style={{backgroundColor:'#fcc083', borderStyle: 'outset', borderColor:'#e6e6e6', marginLeft:'3em', marginRight:'1em', borderRadius:'10px'}}
                    >
                        <RiUserAddLine style={{marginLeft:'0.35rem'}}/>
                    </ButtonIcon>

                     {showSearch &&
                        <>
                            <div style={{minWidth:'250px', maxWidth:'500px'}}>
                                <AsyncSearchBar setListToAdd={setUsersToAdd} setSearch={setSearch} searchFunc={searchFunc} optLabel={'username'} optValue={'email'}/>
                            </div>
                            {
                                usersToAdd != "" && <Button onClick={()=> {usersToAdd.forEach((usr) => dispatch(AddMemberClub(usr.username, club._id))); setShowSearch(false)}}>Invite</Button>
                            }
                        </>
                    }
                    <div style={{marginLeft: 'auto', display:'flex', flexDirection:'row'}}>
                        <InputGroup.Prepend style={{display: 'flex', alignItems:'center', margin:'0.5em'}}>
                            <RiUserSearchLine style={{height:'22px', width:'22px'}}/>
                        </InputGroup.Prepend>
                        <Form className="d-flex">
                            <Form.Control type="search" placeholder="Search member" className="me-2" aria-label="Search" onChange={(event) => setFilterUser(event.target.value)}/>
                        </Form>
                    </div>

                    <CustomDropdown toggle={<GrUserSettings size={20}/>} style={{marginRight:'2em', marginLeft:'2em'}} {...{dropdownItems:[
                                { display: "Expel all members", 
                                  onClick: () => members_list.filter(m=>!admins.includes(m)).forEach(usrnm => dispatch(RemoveMemberCLub(usrnm, _id))), 
                                  icon: <AiOutlineUsergroupDelete className="mr-3" size={22} />,
                                  type: 'delete',
                                  disabled: disableExpelAll
                                },
                            ]}}/>
                </Row>
                <hr/>
                <div style={{dispay:'flex', flexWrap:'wrap'}}>
                {
                    members_list
                        .filter(m=>!admins.includes(m))
                        .filter(user=> filterUser!==''? user.toLowerCase().startsWith(filterUser.toLowerCase()): user)
                        .map( m =>
                        <ButtonElement 
                            key={m}
                            text={m} 
                            onMouseEnter={() => setShowDropdownToggle(true)}
                            onMouseLeave={() => setShowDropdownToggle(false)}
                        >
                            <CustomDropdown {...{showDropdownToggle, dropdownItems:[
                                { display: "Promote", onClick: ()=> dispatch(PromoteToAdmin(_id, m)), icon: <BiArrowToTop className="mr-3" size={16} /> },
                                { display: "Expel", onClick: () => dispatch(RemoveMemberCLub(m, _id)), icon: <BiExit className="mr-3" size={16} />, type: 'delete' },
                            ]}}/>
                        </ButtonElement>
                    )
                }
                </div>
            </div>
        </Col>
    )
}

export default Settings;