import React from "react";
import { CardColumns, Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { StrategyPageCategories, StrategyPageType } from "../../enums/strategy-page.enum";
import { LoadStrategies, LoadStrategy, LoadStrategyChart, ToggleStrategyCard, ToggleStrategyChart, UpdateStrategyCard } from "../../state/strategy/strategy.action";
import SidebarPageCategories from "../sidebar/SidebarPageCategories";

import StrategyCard from "./card/StrategyCard";
import StrategySearch from "./search/StrategySearch";


import "./Strategy.css";

function ConnectedStrategy({cards, page, dispatch, username, search, pagination}) {

    let sidebarTitle = 'Strategies categories';
    let strategyPageList = StrategyPageCategories;
    function onClick(CategoryPage, filter) {
        if(CategoryPage== StrategyPageType.History)
            //this page have only 10 strategies by default, so no page need to be passed
            dispatch(LoadStrategies(CategoryPage, filter))  
        else dispatch(LoadStrategies(CategoryPage, filter, 1))
    }

    return (
        <div className="app-strategy">
            <SidebarPageCategories 
                selected={page} 
                elementList={strategyPageList} 
                title={sidebarTitle} 
                onClick={onClick}
            />
            <StrategySearch/>
            { 
                cards.length > 0 ?
                <Container fluid className="app-strategy-body">
                    <Row lg={1} xl={3} className="app-strategy-list">
                        {
                            cards
                            .sort((a, b) => a.full && !b.full)
                            .map((card) => (
                                <Col 
                                    xl={card.full ? 12 : 4}
                                    className="app-strategy-list--col" 
                                    key={card.id}
                                >
                                    <StrategyCard card={card} username={username} page={page} search={search} pagination={pagination} clubId={undefined}
                                        GeneralLoadStrategy={LoadStrategy} GeneralLoadStrategyChart={LoadStrategyChart} 
                                        GeneralToggleStrategyCard={ToggleStrategyCard} GeneralToggleStrategyChart={ToggleStrategyChart}
                                        GeneralUpdateStrategyCard={UpdateStrategyCard}
                                    />
                                </Col>
                        ))}
                    </Row>      
                </Container>
                    :
                <div className="app-strategy-list--empty">
                    <h4>There are no strategies to display</h4>
                </div>
            }
        </div>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const mapStateToProps = ({ strategies, user }) => {
    return {cards: Object.values(strategies.cards), page: strategies.page, username: user.username, search: strategies.search, pagination: strategies.pagination};
}
const Strategy = connect(mapStateToProps, mapDispatchToProps)(ConnectedStrategy)

export default Strategy;
