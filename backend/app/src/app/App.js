import React, {Suspense} from "react";
import { connect } from "react-redux";
import { Router, withRouter } from "react-router-dom";
import Loader from "react-loader-spinner";

const Header = React.lazy(()=> import("./components/header/Header"));
const Navigator = React.lazy(()=> import("./components/navigator/Navigator"));
const GenericModal = React.lazy(()=> import("./components/modal/Modal"));

import history from "./utils/history.router";

import "./App.css";

const ConnectedApp = ({loading}) => (
    <Router history={history}>
        <Suspense fallback={<div></div>}>
            <div className="app">
                <Header title="PoliOp"/>
                
                { loading &&
                    <div className="app-loader">
                        <Loader type="ThreeDots" color="#fff" height={100} width={100}/>
                    </div>
                }
                    <Navigator/>
            </div>
        </Suspense>
        <GenericModal/>
    </Router>
);

const mapStateToProps = state => {
    return { modalType: state.modal.type, loading: state.app.loading};
};

const App = connect(mapStateToProps)(ConnectedApp)

export default withRouter(App);

