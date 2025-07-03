import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Form } from "react-bootstrap";

import BaseListGroup from "../../../../commons/components/list-groups/BaseListGroup";
import ButtonIcon from "../../../../commons/components/buttons/button-icon/ButtonIcon";

import "./ClubStrategies.css"
import { useState } from "react";
import {AsyncSearchBar, ListSearchBar} from "../../../../commons/components/inputs/multi-choice-search/MultiChoiceSearch";
import API from "../../../../../api/api";
import { AddStrategyToClub, RemoveStrategyFromClub, ToggleClubStrategyCard } from "../../../../state/club/club.action";
import { FaMinusSquare, FaPlusSquare, FaRegMinusSquare, FaRegPlusSquare } from "react-icons/fa";
import BaseListGroupItem from "../../../../commons/components/list-groups/BaseListGroupElement/BaseListGroupElement";
import PaginationElement from "../../../../commons/components/pagination/Pagination";

function ConnectedClubStrategies({club, searchText, sortBy, sort, username, cards, search, wait, dispatch}) {
    const {id, admins, strategies} = club;

    const [isUserAdmin, setIsUserAdmin] = useState(false);
    useEffect(()=> setIsUserAdmin(admins.includes(username)), [JSON.stringify(admins)])

    // add strategy elements
    const [showFormAdd, setShowFormAdd] = useState(false);
    const [stratsToAdd, setStratsToAdd] = useState("");
    const [searchStratToAdd, setSearchStratToAdd] = useState("")

    // search for my strategies that i can add
    const searchMyPublicStratsFunc = async () =>{
        const results = await API.searchMyPublicStrategies(searchStratToAdd)
        // remove strategies that are already added
        return results.filter(strat => !strategies.some(s => s._id === strat._id))
    }

    // remove strategy elements
    const [showFormRemove, setShowFormRemove] = useState(false)
    const [stratsToRemove, setStratsToRemove] = useState("");
    const [stratsThatCanRemove, setStratsThatCanRemove] = useState([])
    useEffect(()=> setStratsThatCanRemove(strategies), [strategies.length])

    // client pagination
    const [currentPage, setCurrentPage] = useState(1)
    useEffect(()=> setCurrentPage(1), [searchText]) // resets the current page to 1 when searching
    const stratsPerPage = 10
    const indexOfLastStrat = currentPage * stratsPerPage;
    const indexOfFirstStrat = indexOfLastStrat - stratsPerPage;
    let searchedStrategies = strategies.filter(strat => searchText!==''? strat.name.toLowerCase().startsWith(searchText.toLowerCase()): strat)
    const currentStrategies = searchedStrategies.slice(indexOfFirstStrat, indexOfLastStrat);
    let pagination = {total: searchedStrategies.length, page: currentPage, size: stratsPerPage}

    function SortResults(a,b){
        switch(sortBy){
            case sort.new:
                return 1;
            case sort.old:
                return -1;
            case sort.upvotes:
                return b.upvotes - a.upvotes
            case sort.bookmarks:
                return b.bookmarks- a.bookmarks
            default:
                return 0;
        }
    }

    return (
        <div className="app-club-strategy-search">
            {isUserAdmin &&
                <div className="app-club-strategy-search--add-remove">
                    {showFormAdd ? 
                        <ButtonIcon 
                            theme="dark"
                            fontSize={23}
                            onClick={() => {setShowFormAdd(false); setShowFormRemove(false)}}
                        >
                            <FaPlusSquare/>
                        </ButtonIcon>
                        :
                        <ButtonIcon 
                            theme="dark"
                            fontSize={23}
                            onClick={() => {setShowFormAdd(true); setShowFormRemove(false)}}
                        >
                            <FaRegPlusSquare/>
                        </ButtonIcon>
                    }
                    {strategies.length>0 && [
                        showFormRemove ?
                            <ButtonIcon 
                                theme="dark"
                                fontSize={23}
                                onClick={() => {setShowFormRemove(false); setShowFormAdd(false)}}
                            >
                                <FaMinusSquare/>
                            </ButtonIcon>
                            :
                            <ButtonIcon 
                                theme="dark"
                                fontSize={23}
                                onClick={() => {setShowFormRemove(true); setShowFormAdd(false)}}
                            >
                                <FaRegMinusSquare/>
                            </ButtonIcon>
                            
                        ]}
                </div>
            }

            {showFormAdd &&
                <div className="app-club-strategy-search--strategies-search">
                    <div>
                        <AsyncSearchBar 
                            setListToAdd={setStratsToAdd} 
                            setSearch={setSearchStratToAdd} 
                            searchFunc={searchMyPublicStratsFunc} 
                            optLabel={'name'} 
                            optValue={'_id'}
                        />
                    </div>
                    {
                        stratsToAdd != "" && 
                        <div className="app-club-strategy-search--center-button">
                            <Button
                                variant="success"
                                onClick={()=> { 
                                    stratsToAdd.forEach(strat => {
                                        dispatch(AddStrategyToClub(id, strat._id)) 
                                    });
                                    setShowFormAdd(false)}}
                            >Add to club</Button>
                        </div>
                    }
                </div>
            }

            {showFormRemove &&
                <div className="app-club-strategy-search--strategies-search">
                    <div>
                        <ListSearchBar 
                            setListOutput={setStratsToRemove} 
                            optLabel={'name'}
                            optValue={'_id'} 
                            listInput={stratsThatCanRemove}
                        />
                    </div>
                    {
                        stratsToRemove != "" && 
                        <div className="app-club-strategy-search--center-button">
                            <Button 
                                variant='danger'
                                onClick={()=> { 
                                    stratsToRemove.forEach(strat => {
                                        dispatch(RemoveStrategyFromClub(club.id, strat._id)) 
                                    });
                                    setShowFormRemove(false)}}
                            >Remove from club</Button>
                        </div>
                    }
                </div>
            }

            {strategies.length>0 ?
                <>
                    <div className="app-club-strategy-search--result">
                        <BaseListGroup
                            items={currentStrategies
                                .sort(SortResults)
                                .map(result => ({
                                    key: result.id,
                                    label: BaseListGroupItem(result, null, username),
                                    selected: result.id in cards,
                                    disabled: wait != 0 || !result.published,
                                    onSelect: (selected) => dispatch(ToggleClubStrategyCard(result, selected))
                                }))
                            }
                        >
                        </BaseListGroup>
                    </div>
                    <div className="mt-2">
                        <PaginationElement pagination={pagination} LoadFunction={setCurrentPage}/>
                    </div>
                </>
                :
                <div className="app-club-strategy-list--empty">
                    <h4>There are no stretegies in the club</h4>
                </div>
            }

        </div>
    );
};

const mapStateToProps = ({ clubs, app, user }) => {
    return {club: clubs.club, wait: app.wait, username: user.username, cards: clubs.club.cards };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}


const ClubStrategiesManagement = connect(mapStateToProps, mapDispatchToProps)(ConnectedClubStrategies)

export default ClubStrategiesManagement;