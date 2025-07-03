import { createStore, combineReducers, applyMiddleware, compose } from "redux";

import {appEffect} from "./app.effect";
import {appReducer} from "./app.reducer";
import {marketsReduce} from "./market/market.reducer";
import {marketsEffect} from "./market/market.effect";
import {modalReducer} from "./modal/modal.reducer";
import {modalEffect} from "./modal/modal.effect";
import {userReducer} from "./user/user.reducer";
import {userEffect} from "./user/user.effect";
import {strategiesEffect} from "./strategy/strategy.effect";
import {strategiesReducer} from "./strategy/strategy.reducer";
import {portflioEffect} from "./portfolio/portfolio.effect";
import {portfolioReducer} from "./portfolio/portfolio.reducer";
import {clubsEffect} from "./club/club.effect";
import {clubsReducer} from "./club/club.reducer";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function rootEffect(action, dispatch) {
  console.log("Effect: " + JSON.stringify(action.type));
  appEffect(action, dispatch);
  userEffect(action, dispatch);
  modalEffect(action, dispatch);
  marketsEffect(action, dispatch);
  strategiesEffect(action, dispatch);
  portflioEffect(action, dispatch);
  clubsEffect(action, dispatch)
}

export function rootMiddleware({ dispatch }) {
    return function(next) {
      return function(action) {
        rootEffect(action, dispatch);
        return next(action);
      };
    };
  }

const rootReducer = combineReducers({
  app: appReducer,
  user: userReducer,
  modal: modalReducer,
  markets: marketsReduce,
  strategies: strategiesReducer,
  portfolio: portfolioReducer,
  clubs: clubsReducer,
});

const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(rootMiddleware))
);

export default store;