import React, {useEffect} from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";

import { RiShareForwardFill } from "react-icons/ri";
import { MdDelete, MdEdit, MdPublic, MdSettings, MdVpnLock } from "react-icons/md";
import ButtonIcon from "../../../commons/components/buttons/button-icon/ButtonIcon";
import { LoadStrategyPage, UpdateStrategy, LoadStrategyPageChart } from "../../../state/strategy/strategy.action";
import { useLocation } from "react-router";
import { useState } from "react";

import "./StrategyPage.css"
import { getCountryMoneyFormat } from "../../../utils/currency.format";
import BaseTable from "../../../commons/components/table/BaseTable";
import { getMarketColumns } from "../../../enums/market-columns.enum";
import { OpenMarketTab } from "../../../state/market/market.action";
import { NavigateTo } from "../../../state/app.action";
import { PositionOperation, PositionStatus } from "../../../enums/option-type.enum";
import { getPastPositionColumns, getPositionColumns } from "../../../enums/position-columns.enum";
import { OpenModal } from "../../../state/modal/modal.action";
import { ModalCatalog } from "../../../enums/modal-catalog.enum";
import CustomDropdown from "../../../commons/components/dropdown/dropdown-custom-icon";
import PrivatePage from "../../private page/PrivatePage";


function NavbarStrategyPage(props){
    const {strategy, isStrategyMine, dispatch} = props;
    const {id, name, published, upvotes, bookmarks} = strategy;
    return(
        <Container>
        <div className="app-strategy-page--navbar">
            <h2>{name}</h2>
            <div className="app-strategy-page--info">
                {isStrategyMine &&
                    <div className="app-strategy-page--visibility">
                        <div>Visibility: </div>
                        
                            <ButtonIcon
                                fontSize={20}
                            >   
                                {published ? <MdPublic style={{color:'green'}}/>: <MdPublic style={{color:'darkred'}}/>}
                            </ButtonIcon>
                    </div>
                }
                <div className="app-strategy-page--info-stats">Upvotes: <strong>{upvotes.length}</strong></div>
                <div className="app-strategy-page--info-stats">Bookmarks: <strong>{bookmarks.length}</strong></div>
            </div>
            <div className="app-strategy-page--actions">
                    {/**In the modal for sharing i have to retrieve groupId and country for the server in order to pass object with same attributes when sharing from card */}
                    {(published
                        // || (!published && isStrategyMine)
                        ) && <ButtonIcon 
                                active={true} 
                                theme="dark" 
                                fontSize={18} 
                                onClick={() => dispatch(OpenModal(ModalCatalog.ShareStrategy({...strategy, groupId: strategy.group.symbol, country: strategy.markets[0].country})))}
                            >
                                <RiShareForwardFill/>
                            </ButtonIcon>
                    }

                    {isStrategyMine && 
                        <CustomDropdown toggle={<MdSettings size={18}/>} {...{dropdownItems:[
                            { display: "Modify strategy", 
                                onClick: () => dispatch(OpenModal(ModalCatalog.UpdateStrategy(strategy))), 
                                icon: <MdEdit className="mr-3" size={18} />,
                            },
                            { display: "Delete strategy", 
                                onClick: () => dispatch(OpenModal(ModalCatalog.DeleteStrategy(id))), 
                                icon: <MdDelete className="mr-3" size={18} />,
                                type: 'delete',
                            }
                        ]}}/>

                    }
            </div>
        </div>
        </Container>
    );
}


function Description({strategy}){
    const { userId, markets, price, positions, group, stats} = strategy;
    let market = markets && markets.length > 0 ? markets[0] : {}
    const {original} = stats
    return(
        <>
            <Row className="app-strategy-page--description-stats">
                <Col className="app-strategy-page--description-left">
                    <div className="app-strategy-page--description-stats-number" style={{marginBottom: '3em'}}>Created by: </div>
                    <div className="app-strategy-page--description-stats-number">Profits: </div>
                    <div className="app-strategy-page--description-stats-number">Costs: </div>
                    <div className="app-strategy-page--description-stats-number">Price: </div>        
                    <div className="app-strategy-page--description-stats-number">Positions: </div>
                    <div className="app-strategy-page--description-stats-number">Group: </div>
                </Col>
                <Col>
                    <div className="app-strategy-page--description-stats-number" style={{marginBottom: '3em'}}>{userId}</div>
                    <div className="app-strategy-page--description-stats-number" style={{color: original.possibleROI >= original.cost ? "darkgreen" : "darkred"}}>{getCountryMoneyFormat(market.country, original.possibleROI - original.cost)}</div>
                    <div className="app-strategy-page--description-stats-number">{getCountryMoneyFormat(market.country, original.cost - original.effectiveROI)}</div>
                    <div className="app-strategy-page--description-stats-number">{price}</div>
                    <div className="app-strategy-page--description-stats-number">{positions.length}</div>
                    <div className="app-strategy-page--description-stats-number">{group ? group.name : "-"}</div>
                </Col>
            </Row>
        </>
    );
}


function ConnectedStrategyPage({strategy, user, dispatch, wait}) {
    const [isStrategyMine, setIsStrategyMine] = useState();
    const {userId, whatif, id, markets, positions, published} = strategy;
    
    const location = useLocation();
    let idFromUrl = location.pathname.split('/')[3]
    useEffect(()=> {
        dispatch(LoadStrategyPage(idFromUrl))
    }, []);

    useEffect(()=> setIsStrategyMine(userId === user.username), [userId, user.username])

    // position changes
    const [orders, setOrders] = useState({});

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

    return (
        <>
            <Container fluid style={{overflow:'scroll'}}>
                    {isStrategyMine || published ?
                        <>
                            <NavbarStrategyPage {...{strategy, isStrategyMine, dispatch}}/>
                            <Row className="app-strategy-page--row-info-chart">
                                <Col lg={4} style={{overflow:'scroll'}}>
                                    <Description {...{strategy}}/>
                                </Col>
                                <Col lg={8}>
                                    <Row className="app-strategy-page--row-tables">
                                        <h5>Market</h5>
                                        <BaseTable
                                            columns={getMarketColumns(true , !isStrategyMine, (market) =>{
                                                dispatch(OpenMarketTab({...market, expiration: undefined, date: undefined, strategyId: id}))
                                                dispatch(NavigateTo("/app/markets"))
                                            })}
                                            data={markets}
                                            pagination={false}
                                        />
                                    </Row>
                                    <Row className="app-strategy-page--row-tables">
                                        <h5>Positions</h5>
                                        <BaseTable
                                            columns={getPositionColumns(true, changeOrders, submitOrders, !isStrategyMine)}
                                            data={positions.filter(p=> p.status != PositionStatus.Close)}
                                            pagination={false}
                                        />
                                    </Row>
                                    <Row className="app-strategy-page--row-tables">
                                        <h5>Past Positions</h5>
                                        <BaseTable
                                            columns={getPastPositionColumns(true, whatif, changeOrders, submitOrders, !isStrategyMine)}
                                            data={positions.filter(p=> p.status === PositionStatus.Close).sort((a,b)=> a.id.localeCompare(b.id))}
                                            pagination={false}
                                        />
                                    </Row>
                                </Col>
                            </Row>
                        </>
                        :
                        <PrivatePage text={'This strategy is private'} page={'strategies'} dispatch={dispatch}/>
                        
                    }
            </Container>
        </>
    );
};

const mapStateToProps = (state) => {
    return {strategy: state.strategies.strategy, user: state.user, wait: state.app.wait};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const StrategyPage = connect(mapStateToProps, mapDispatchToProps)(ConnectedStrategyPage)

export default StrategyPage;
