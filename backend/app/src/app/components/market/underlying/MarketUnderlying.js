import React from "react";
import { capitalizeFirst } from "react-stockcharts/lib/utils";

import "./MarketUnderlying.css";

const MarketUnderlying = ({tab, underlying}) => (
    <div className="app-market-underlying">
        <div className="app-market-underlying-title">
            <h1>{tab.label}</h1>
            <h2>{tab.exchange}</h2>
            <h4>{tab.country}</h4>
            <h5>{capitalizeFirst(tab.template)}</h5>
        </div>
        <div className="app-market-underlying-prices">
            <div>Last: {underlying.price}</div>
            <div>Open - Close: {underlying.open} - {underlying.close}</div>
            <div>High - Low: {underlying.high} - {underlying.low}</div>
        </div>
    </div>
);

export default MarketUnderlying;
