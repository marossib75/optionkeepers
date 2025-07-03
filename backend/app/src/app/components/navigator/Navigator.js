import React from "react";
import { Suspense } from "react";
import { Redirect, Switch } from "react-router";
import { Route } from "react-router-dom";
import ClubPage from "../club/single page/ClubPage";
import StrategyPage from "../strategy/single page/StrategyPage";

const Market = React.lazy(() => import('../market/Market'));
const Portfolio = React.lazy(() => import('../portfolio/Portfolio'));
const StrategiesPage = React.lazy(() => import('../strategy/Strategy'));
const Clubs = React.lazy(() => import('../club/Clubs'));

import "./Navigator.css";

function Navigator() {
    return (
        <div className="app-navigator">
            <Suspense fallback={<div></div>}>
                <Switch>
                    <Route path='/app/clubs/:creator_userId/:name'>
                        <ClubPage/>
                    </Route>
                    <Route path='/app/strategies/:id'>
                        <StrategyPage/>
                    </Route>
                    <Route path='/app/market'>
                        <Market/>
                    </Route>
                    <Route path='/app/strategies'>
                        <StrategiesPage/>
                    </Route>
                    <Route path='/app/portfolio'>
                        <Portfolio/>
                    </Route>
                    <Route path='/app/clubs'>
                        <Clubs/>
                    </Route>
                    <Route path='/app/profile'>
                    </Route>
                    <Route path='/app'>
                        <Redirect to='/app/market'/>
                    </Route>
                </Switch>
            </Suspense>
        </div>
    );  
}

export default Navigator;
