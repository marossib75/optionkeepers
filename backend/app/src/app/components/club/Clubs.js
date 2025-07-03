import React, {useEffect, useState} from "react";

import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { LoadClubs } from "../../state/club/club.action";
import ClubCard from "./card/ClubCard";
import NavbarClubs from "./navbar/ClubsNavbar";
import SidebarPageCategories from "../sidebar/SidebarPageCategories";

import "./Clubs.css"
import { ClubPageCategories, ClubPageType } from "../../enums/club-page.enum";
import Pagination from "../../commons/components/pagination/Pagination";

function ConnectedClubs({page, search, results, wait, dispatch, pagination}) {
    useEffect(()=> dispatch(LoadClubs(page, search, 1)), []);

    let sidebarTitle = 'Club categories';
    let clubPageList = ClubPageCategories;
    function onClick(CategoryPage, filter) {
        dispatch(LoadClubs(CategoryPage, filter, 1))
    }

    return (
           <>
                <div className="app-club-category--column">
                    <SidebarPageCategories selected={page} elementList={clubPageList} title={sidebarTitle} onClick={onClick}/>
                </div>
                <Container fluid className="app-club-list--container">
                    <NavbarClubs/>
                    {    (results.length>0 && wait==0) ?
                        <Row sm={1} md={2} lg={3} xl={4} style={{overflow: 'scroll'}}>
                            {
                                results
                                .map(club => 
                                    <Col key={club.id}>
                                        <ClubCard club={club}/>
                                    </Col>
                                    )
                            }
                        </Row>
                        :
                        page === ClubPageType.Personal ?
                            search? <div className="app-club-list--empty">
                                        <h4>There are no clubs to display</h4>
                                    </div>
                                    :
                                    <div className="app-club-list--empty">
                                        <h4>You haven't created any club</h4>
                                    </div>
                            :
                            <div className="app-club-list--empty">
                                <h4>There are no clubs to display</h4>
                            </div>
                    }
                    <div className="app-club-list--pagination">
                        <Pagination 
                            pagination={pagination} 
                            LoadFunction={(clickedPage) => dispatch(LoadClubs(page, search, clickedPage, pagination.orderBy, pagination.order))}/>
                    </div>


                </Container>
            </>
        
    );
};

const mapStateToProps = ({ clubs, app }) => {
    return {...clubs, wait: app.wait};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const ClubsPage = connect(mapStateToProps, mapDispatchToProps)(ConnectedClubs)

export default ClubsPage;
