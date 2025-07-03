import React, { Suspense } from "react";
import { Provider } from "react-redux";

import { LoadUser } from "./app/state/user/user.action";
import { LoadExchanges, LoadGroups } from "./app/state/app.action";

import store from "./app/state/app.store";

store.dispatch(LoadUser());
store.dispatch(LoadGroups());
store.dispatch(LoadExchanges());

const App = React.lazy(() => import("./app/App"));
const AppProvider = () => <Provider store={store}><Suspense fallback={<div></div>}><App/></Suspense></Provider> 

export default AppProvider;