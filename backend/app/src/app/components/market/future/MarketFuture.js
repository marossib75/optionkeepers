import React, { useState } from "react";
import { connect } from "react-redux";

import { ToggleMarketFutures } from "../../../state/market/actions/market-futures.action";
import { UpdateMarketStrategy } from "../../../state/market/actions/market-strategy.action";

import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";
import BaseTable from "../../../commons/components/table/BaseTable";

import {getFutureTableColumns} from "../../../enums/future-columns.enum";

import "./MarketFuture.css";

const filterItem = (item, filter) => {
    var passed = true;

    if (filter && filter.text && item) {
        passed = false;

        Object.keys(item).forEach(key =>{
            var value =  item[key]
            passed = value ? JSON.stringify(value).toLowerCase().includes(filter.text.toLowerCase()) || passed : passed;
        });
    } 
    return passed;
}

function ConnectedMarketFuture({tab, futures, disabled, dispatch}) {
    const [orders, setOrders] = useState({});

    const changeOrders = (order) => {
        orders[order.id] = {...orders[order.id], ...order};
        setOrders(orders);
    };
    
    const submitOrders = () => {
        let submits = [];

        Object.values(orders).forEach(order => {
            if (order.quantity != 0) {
                submits.push(order);
            }
        });

        if (submits.length > 0) {
            dispatch(UpdateMarketStrategy(tab, null, null, submits, null));
        }
        setOrders({});
    };

    return (
        <BaseAccordion
            title="Futures"
            open={futures.open}
            loading={futures.loading}
            onToggle={() => dispatch(ToggleMarketFutures())}
        >
            <BaseTable
                failed={!futures.loading && futures.failed}
                columns={getFutureTableColumns(tab, changeOrders, submitOrders)}
                disabled={disabled && futures.data.length > 0}
                data={futures.data}
                paginationPerPage={10}
                filterInit={{text: ""}}
                filterItem={filterItem}
            >
            </BaseTable>
        </BaseAccordion>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const MarketFuture = connect(null, mapDispatchToProps)(ConnectedMarketFuture)

export default MarketFuture;
