import React, { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import LoadingOverlay from "react-loading-overlay";
import { Card } from "react-bootstrap";
import { connect } from "react-redux";
import { CgClose } from "react-icons/cg";
import { VscScreenFull } from "react-icons/vsc";
import { BiRefresh, BiWindowOpen } from "react-icons/bi";

import {getCountryMoneyFormat} from "../../../utils/currency.format";

import ErrorBoundary from "../../../commons/components/error-boundary/ErrorBoundary";
import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";
import BaseTable from "../../../commons/components/table/BaseTable";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";
import BaseChart from "../../../commons/components/charts/BaseChart";

import { getMarketColumns } from "../../../enums/market-columns.enum";
import { getPositionColumns } from "../../../enums/position-columns.enum";
import { PositionOperation, PositionStatus } from "../../../enums/option-type.enum";

import { BookmarkStrategy, LoadStrategies, 
    UpdateStrategy, UpvoteStrategy } from "../../../state/strategy/strategy.action";
import { OpenMarketTab } from "../../../state/market/market.action";


import "./StrategyCard.css";
import { NavigateTo } from "../../../state/app.action";
import { RiShareForwardLine } from "react-icons/ri";
import { BsBookmark, BsBookmarkFill, BsFillPersonFill } from "react-icons/bs";
import { StrategyPageType } from "../../../enums/strategy-page.enum";
import { MdPublic } from "react-icons/md";
import AnimatedButton from "../../../commons/components/buttons/button-upvote-animated/AnimatedUpvoteButton";
import { TiArrowUpOutline, TiArrowUpThick } from "react-icons/ti";
import { InteractionType } from "../../../enums/interaction-catalog.enum";
import { OpenModal } from "../../../state/modal/modal.action";
import { ModalCatalog } from "../../../enums/modal-catalog.enum";


function Controls({published, onOpen, onShare, onRefresh, onResize, onClose}) {
    return (
        <div className="app-strategy-card--actions">
            <div className="app-strategy-card--move">
                <div className="app-strategy-card--buttons">
                    <ButtonIcon 
                        theme="dark"
                        fontSize={20}
                        onClick={onOpen}>
                            <BiWindowOpen/>
                    </ButtonIcon>
                    {published &&
                        <ButtonIcon 
                            theme="dark"
                            fontSize={20}
                            onClick={onShare}>
                                <RiShareForwardLine/>
                        </ButtonIcon>
                    }
                </div>
            </div>
            <div className="app-strategy-card--controls">
                <div className="app-strategy-card--buttons">
                    <ButtonIcon 
                        theme="dark"
                        fontSize={20}
                        onClick={onRefresh}>
                            <BiRefresh/>
                    </ButtonIcon>
                    <ButtonIcon 
                        theme="dark"
                        check={true}
                        fontSize={20}
                        onClick={onResize}>
                            <VscScreenFull/>
                    </ButtonIcon>
                    <ButtonIcon 
                        theme="dark" 
                        fontSize={20} 
                        onClick={onClose}>
                            <CgClose/>
                    </ButtonIcon>
                </div>
            </div>
        </div>
    )
}

function Header({title, userId, isStrategyMine, price, group, market, stats, positions}) {
    const {original} = stats
    return (
        <div className="app-strategy-card--header mb-3">
            <div className="app-strategy-card--info">
                <Card.Title>{title}</Card.Title>
                <Card.Text style={{fontSize:'12px', marginBottom:'10px'}}>{isStrategyMine? <div><BsFillPersonFill style={{marginBottom:'1px'}}/> You</div> : userId}</Card.Text>
                <Card.Text>{group ? group.name : "-"}</Card.Text>
                <Card.Text><b>{price}</b></Card.Text>
            </div>
            <div className="app-strategy-card--stats">
                <Card.Title className={`${original.possibleROI >= original.cost ? "green" : "red"}`}>{getCountryMoneyFormat(market.country, original.possibleROI - original.cost)}</Card.Title>
                <Card.Text style={{fontSize:'12px', marginBottom:'10px'}}>&nbsp;</Card.Text>
                <Card.Text>Costs: {getCountryMoneyFormat(market.country, original.cost - original.effectiveROI)}</Card.Text>
                <Card.Text>Tot. Positions: {positions.length}</Card.Text>
            </div>
        </div>      
    );
};

function Interactions({isStrategyMine, published, nUpvotes, nBookmarks, isUpvoted, isBookmarked, onUpvote, onDownvote, onBookmark, onRemoveBookmark}){
    let style={backgroundColor:'white', borderRadius:'4px', margin:'5px', display:'flex', color:'black'}
    return (
        <div className="app-strategy-card--interactions">
                <span className="app-strategy-card--interaction-button">   
                    <strong>{nUpvotes}</strong>
                    <AnimatedButton 
                        iconFill={TiArrowUpThick}
                        iconOutline={TiArrowUpOutline}
                        iconSize = {'37px'}
                        isUpvoted={isUpvoted}
                        upvote={onUpvote}
                        downvote={onDownvote}
                    />
                </span>
            {isStrategyMine &&
                <ButtonIcon
                    fontSize={16}
                    style={style}
                >   
                    {published ? <MdPublic style={{color:'green'}}/>: <MdPublic style={{color:'darkred'}}/>}
                </ButtonIcon>
            }
            <span className="app-strategy-card--interaction-button">   
                    <strong>{nBookmarks}</strong>
                    <AnimatedButton 
                        iconFill={BsBookmarkFill}
                        iconOutline={BsBookmark}
                        iconSize={'35px'}
                        isUpvoted={isBookmarked}
                        upvote={onBookmark}
                        downvote={onRemoveBookmark}
                        isDisabled={isStrategyMine}
                    />
                </span>
        </div>
    )
}

function ConnectedStrategyCard({card, dispatch, username, page, search, pagination, clubId,
    GeneralLoadStrategy, GeneralLoadStrategyChart, GeneralToggleStrategyCard, GeneralToggleStrategyChart, GeneralUpdateStrategyCard,
}) {
    const {userId, full, whatif, failed, loading, id, name, price, group, markets, positions, stats, chart, published, upvotes, bookmarks} = card;
    const [orders, setOrders] = useState({});
    const [isUpvoted, setIsUpvoted] = useState();
    const [isBookmarked, setIsBookmarked] = useState();
    const [isStrategyMine, setIsStrategyMine] = useState()

    
    const changeOrders = (order) => {
        orders[order.id] = {...orders[order.id], ...order};
        setOrders(orders);
    };

    const submitOrders = (order=undefined) => {
        if (order !== undefined)
            orders[order.id] = {...orders[order.id], ...order};

        let submits = [];

        positions.forEach(position => {

            if (position.id in orders) {
                let order = orders[position.id];
                
                if (order.quantity != 0) {
                    submits.push(order);
    
                    if ( ((order.status != position.status || order.operation === PositionOperation.Delete)
                    && Math.abs(order.quantity) < Math.abs(position.quantity))) {
                        submits.push({...order, operation: PositionOperation.Add, status: position.status, quantity: position.quantity - order.quantity});
                    }
                }
            }
        });
        if (submits.length > 0) {
            dispatch(UpdateStrategy(id, null, null, submits, {...whatif, enabled: false}));
        }
        setOrders({})
    };

    // Refresh the card on first time rendering
    useEffect(() => dispatch(GeneralLoadStrategy(id)), [card.id]);
    // Check if is upvoted/bookmarked once rendered
    useEffect(()=> Array.isArray(upvotes)? setIsUpvoted(upvotes.filter(u=>u == username).length>0): setIsUpvoted(false), [upvotes.length])
    useEffect(()=> Array.isArray(bookmarks) ? setIsBookmarked(bookmarks.filter(u=>u == username).length>0): setIsBookmarked(false), [bookmarks.length])
    useEffect(()=> setIsStrategyMine(userId === username), [userId, username])

    return (
        <Card className={`app-strategy-card`} style={{borderColor: isStrategyMine? '': 'orange'}}>
            <LoadingOverlay
                active={loading}
                spinner={<Loader className="app-accordion--loader" type="ThreeDots" color="#bbbbbb" height={100} width={100}/>}
                fadeSpeed={0}
            >
                <Controls
                    published={published}
                    onOpen={()=> dispatch(NavigateTo(`/app/strategies/${id}`))}
                    onShare={()=> dispatch(OpenModal(ModalCatalog.ShareStrategy(card)))}
                    onRefresh={() => dispatch(GeneralLoadStrategy(id))}
                    onResize={() => {
                        dispatch(GeneralUpdateStrategyCard({...card, full: !full}));
                        dispatch(GeneralToggleStrategyChart(id)); 
                    }}
                    onClose={() => dispatch(GeneralToggleStrategyCard(card, true))}
                />
                <Card.Body>
                    <ErrorBoundary failed={failed}>
                        <Header
                            title={name}
                            userId={userId}
                            isStrategyMine={isStrategyMine}
                            price={price}
                            group={group}
                            stats={stats}
                            positions={positions}
                            market={markets && markets.length > 0 ? markets[0] : {}}
                        />
                        <Interactions
                            published={published}
                            isStrategyMine={isStrategyMine}
                            nUpvotes={upvotes.length}
                            nBookmarks={bookmarks.length}
                            isUpvoted={isUpvoted}
                            isBookmarked={isBookmarked}
                            onUpvote={() => dispatch(UpvoteStrategy(id, InteractionType.Vote, search, page, pagination, clubId))}
                            onDownvote={() => dispatch(UpvoteStrategy(id, InteractionType.Unvote, search, page, pagination, clubId))}
                            onBookmark={()=> dispatch(BookmarkStrategy(id, InteractionType.Vote, search, page, pagination, clubId))}  
                            onRemoveBookmark={()=> dispatch(BookmarkStrategy(id, InteractionType.Unvote, search, page, pagination, clubId))}  
                        />
                        <BaseAccordion title="Chart" as={Card.Link} open={true}>
                            <BaseChart 
                                chart={chart}
                                onSelect={() => dispatch(GeneralLoadStrategyChart(id, chart.id))}
                            />
                        </BaseAccordion>
                        <BaseAccordion title="Markets" as={Card.Link}>
                            <BaseTable
                                columns={getMarketColumns(full, !isStrategyMine, (market) => {
                                        dispatch(OpenMarketTab({...market, expiration: undefined, date: undefined, strategyId: id}));
                                        dispatch(NavigateTo("/app/markets"));
                                    }
                                )}
                                data={markets}
                                pagination={false}
                                >
                            </BaseTable>
                        </BaseAccordion>
                        <BaseAccordion title="Opens" as={Card.Link}>
                            <BaseTable
                                columns={getPositionColumns(full, changeOrders, submitOrders, !isStrategyMine)}
                                data={positions.filter(p => p.status != PositionStatus.Close)}
                                pagination={false}
                                >
                            </BaseTable>
                        </BaseAccordion>
                    </ErrorBoundary>
                </Card.Body>
            </LoadingOverlay>
        </Card>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const StrategyCard = connect(null, mapDispatchToProps)(ConnectedStrategyCard)

export default StrategyCard;
