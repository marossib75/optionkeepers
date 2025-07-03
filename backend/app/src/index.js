import React, {Suspense} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import { unregister } from "./serviceWorker";

const AppProvider = React.lazy(() => import("./provider"));

// Version 0.1
ReactDOM.render(
      <Router>
          <Suspense fallback={<div></div>}>
            <AppProvider/>
          </Suspense>
      </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();