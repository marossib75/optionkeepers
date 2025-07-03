import React from "react";

import MarketTab from "./tab/MarketTab";
import MarketSearch from "./search/MarketSearch";

import "./Market.css";


function Market() {
    return (
        <div className="app-market">
            <MarketSearch/>
            <MarketTab/>
        </div>
    );
};

export default Market;
