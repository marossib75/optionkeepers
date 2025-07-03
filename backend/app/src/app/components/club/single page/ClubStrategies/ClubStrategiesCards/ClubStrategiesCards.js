import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { LoadClubStrategy, LoadClubStrategyChart, ToggleClubStrategyCard, ToggleClubStrategyChart, UpdateClubStrategyCard } from "../../../../../state/club/club.action";
import StrategyCard from "../../../../strategy/card/StrategyCard";

import "./ClubStrategiesCards.css";

function ConnectedClubStrategiesCards({cards, username, clubId}) {

    return (
        <div className="app-club-strategy">
            
            { 
                cards.length > 0 ?
                <Container fluid className="app-club-strategy-body">
                    <Row lg={1} xl={3} className="app-club-strategy-list">
                        {
                            cards
                            .sort((a, b) => a.full && !b.full)
                            .map((card) => (
                                <Col 
                                    xl={card.full ? 12 : 6}
                                    className="app-club-strategy-list--col" 
                                    key={card.id}
                                >
                                    <StrategyCard card={card} username={username} page={undefined} search={undefined} pagination={undefined} clubId={clubId}
                                         GeneralLoadStrategy={LoadClubStrategy} GeneralLoadStrategyChart={LoadClubStrategyChart} 
                                         GeneralToggleStrategyCard={ToggleClubStrategyCard} GeneralToggleStrategyChart={ToggleClubStrategyChart}
                                         GeneralUpdateStrategyCard={UpdateClubStrategyCard}
                                    />
                                </Col>
                        ))}
                    </Row>      
                </Container>
                    :
                <div className="app-club-strategy-list--empty">
                    <h4>There are no strategies open</h4>
                </div>
            }
        </div>
    );
};


const mapStateToProps = ({ clubs, user }) => {
    return {cards: Object.values(clubs.club.cards), username: user.username, clubId: clubs.club.id};
}
const ClubStrategiesCards = connect(mapStateToProps)(ConnectedClubStrategiesCards)

export default ClubStrategiesCards;
