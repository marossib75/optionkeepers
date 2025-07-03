import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, Form } from "react-bootstrap";
import { SiAddthis } from "react-icons/si";

import BaseListGroup from "../../../commons/components/list-groups/BaseListGroup";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";

import { LoadStrategies, RemoveSharedStrategy, ToggleStrategyCard } from "../../../state/strategy/strategy.action";
import { OpenModal } from "../../../state/modal/modal.action";

import { ModalCatalog } from "../../../enums/modal-catalog.enum";

import "./StrategySearch.css";
import { StrategyPageType } from "../../../enums/strategy-page.enum";
import BaseListGroupItem from "../../../commons/components/list-groups/BaseListGroupElement/BaseListGroupElement";
import PaginationElement from "../../../commons/components/pagination/Pagination";
import CustomDropdown from "../../../commons/components/dropdown/dropdown-custom-icon";
import { MdSort } from "react-icons/md";
import { BsBookmark, BsList, BsPeople } from "react-icons/bs";
import { TiArrowUpOutline } from "react-icons/ti";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { FaMinusSquare } from "react-icons/fa";
import { ListSearchBar } from "../../../commons/components/inputs/multi-choice-search/MultiChoiceSearch";


function ConnectedStrategySearch({search, results, cards, page, groups, wait, dispatch, username, pagination}) {
    useEffect(()=> dispatch(LoadStrategies(page, search, 1)), []);
    const [open, setOpen] = useState(false);
    const [sharedToRemove, setSharedToRemove] = useState([]);

    const dropdownItems = [
        {   display: "New first", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'created', -1)), 
            icon: <BiSortDown className="mr-3" size={18} />,
            active: (pagination.sortBy=='created' && pagination.order == -1)|| pagination.sortBy==null
        },
        {   display: "Old first", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'created', 1)), 
            icon: <BiSortUp className="mr-3" size={18} />,
            active: pagination.sortBy=='created'&& pagination.order == 1
        },
        {   display: "Most upvoted", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'upvotes', -1)), 
            icon: <TiArrowUpOutline className="mr-3" size={18} />,
            active: pagination.sortBy=='upvotes'
        },
        {   display: "Most saved", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'bookmarks', -1)), 
            icon: <BsBookmark className="mr-3" size={18} />,
            active: pagination.sortBy=='bookmarks'
        },
        {   display: "Most positions", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'positions', -1)), 
            icon: <BsList className="mr-3" size={18} />,
            active: pagination.sortBy=='positions'
        },
        {   display: "Number of clubs", 
            onClick: () => dispatch(LoadStrategies(page, search, 1, 'clubs', -1)), 
            icon: <BsPeople className="mr-3" size={18} />,
            active: pagination.sortBy=='clubs'
        },
    ]

    return (
        <div className="app-strategy-search">

            {page == StrategyPageType.History &&  <div className="app-strategy-search--title">Last 10 strategies opened: </div>}
            {page == StrategyPageType.Shared  &&  <div className="app-strategy-search--title">Strategies shared with you: </div>}

            <div style={{display:'flex', flexDirection:'row'}}>
                { !(page == StrategyPageType.History) &&
                    <Form className="app-strategy-search--form" onSubmit={e=> e.preventDefault()}>
                        <Form.Group controlId="searchForm">
                            <Form.Control
                                type="text"
                                value={search || ""}
                                placeholder="Search"
                                onChange={(event) => dispatch(LoadStrategies(page, event.target.value, 1))}
                                disabled={results.length ==0}
                            />
                        </Form.Group>
                    </Form>
                }

                {page == StrategyPageType.Personal &&
                    <div className="app-strategy-search--add">
                        <ButtonIcon 
                            theme="dark"
                            fontSize={20}
                            onClick={() => dispatch(OpenModal(ModalCatalog.CreateStrategy(groups)))}
                        >
                            <SiAddthis/>
                        </ButtonIcon>
                    </div>
                }
                {page == StrategyPageType.Shared &&
                    <div className="app-strategy-search--add">
                        <ButtonIcon 
                            theme="dark"
                            fontSize={20}
                            onClick={() => setOpen(!open)}
                        >
                            <FaMinusSquare/>
                        </ButtonIcon>
                    </div>
                }
            </div>

            {open &&
                <div className="app-club-strategy-search--strategies-search">
                    <div>
                        <ListSearchBar 
                            setListOutput={setSharedToRemove} 
                            optLabel={'name'}
                            optValue={'_id'} 
                            listInput={results}
                        />
                    </div>
                    {
                        sharedToRemove != "" && 
                        <div className="app-club-strategy-search--center-button">
                            <Button 
                                variant='danger'
                                onClick={()=> { 
                                    sharedToRemove.forEach(strat => {
                                        dispatch(RemoveSharedStrategy(strat._id)) 
                                    });
                                    setOpen(false)}}
                            >Remove</Button>
                        </div>
                    }
                </div>
            }

            {page != StrategyPageType.History && page != StrategyPageType.Shared && results.length >0 &&
                <div className="app-strategy-search--sort">
                    <div>Sort by: <strong>{pagination.sortBy? pagination.sortBy : 'created'}</strong></div>
                    <CustomDropdown toggle={<MdSort size={18}/>} {...{dropdownItems}}/>
                </div>
            }

           {results.length >0 ?
                <div className="app-strategy-search--result">
                    <BaseListGroup
                        items={results
                            .map(result => ({
                                key: result.id,
                                label: BaseListGroupItem(result, page, username),
                                selected: result.id in cards,
                                disabled: wait != 0 || (!result.published && username != result.userId),
                                onSelect: (selected) => dispatch(ToggleStrategyCard(result, selected)),
                            }))
                        }
                    >
                    </BaseListGroup>
                </div>
                :
                <div className="app-strategy-list--empty">
                    <h4>There are no stretegies in this category</h4>
                </div>
            }

            <div className="app-strategy-search--pagination">
                <PaginationElement 
                    pagination={pagination} 
                    LoadFunction={(clickedPage) => dispatch(LoadStrategies(page, '', clickedPage, pagination.sortBy, pagination.order))}/>
            </div>

        </div>
    );
};

const mapStateToProps = ({ strategies, app, user }) => {
    return {...strategies, groups: app.groups, wait: app.wait, username: user.username };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}


const StrategySearch = connect(mapStateToProps, mapDispatchToProps)(ConnectedStrategySearch)

export default StrategySearch;
