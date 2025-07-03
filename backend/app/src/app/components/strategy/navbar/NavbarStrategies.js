import React, { useEffect } from "react";
import { Container, Navbar, Form, Button } from "react-bootstrap";
import { connect } from "react-redux";

import { LoadStrategies } from "../../../state/strategy/strategy.action";


function ConnectedStrategyNavbar({search, dispatch}){
    useEffect(()=> dispatch(LoadStrategies(search)), []);

    return(
        <Navbar>
            <Container className="justify-content-center">
                <Navbar.Brand>Strategies</Navbar.Brand>
                <div className="mr-auto">
                    <Button style={{margin:'1em'}}>My strategies</Button>
                    <Button>Bookmarks</Button>
                </div>
                <Button style={{margin:'1em'}}>Explore</Button>
                <Form className="justify-content-end">
                    <Form.Group controlId="searchForm">
                        <Form.Control
                            type="text"
                            value={search || ""}
                            placeholder="Search"
                            onChange={(event) => dispatch(LoadStrategies(event.target.value))}
                        />
                    </Form.Group>
                </Form>
            </Container>
        </Navbar>
    );
};

const mapStateToProps = ({ strategies, app }) => {
    return {...strategies, wait: app.wait };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const NavbarStrategy = connect(mapStateToProps, mapDispatchToProps)(ConnectedStrategyNavbar)

export default NavbarStrategy;