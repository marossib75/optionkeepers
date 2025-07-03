import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "react-redux";

import { UpdateMarketStrategy } from "../../../state/market/actions/market-strategy.action";
import { LoadMarketChain, SetMarketChainPerPage, ToggleMarketChain } from "../../../state/market/actions/market-chain.action";

import BaseTable from "../../../commons/components/table/BaseTable";
import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";

import MarketChainHeader from "./header/MarketChainHeader";

import { getChainTableColumns } from "../../../enums/chain-columns.enum";

import "./MarketChain.css";

function TableHeader() {
    return (
        <div className="app-market-chain--table-header">
            <h4>Calls</h4>
            <div></div>
            <h4>Puts</h4>
        </div>
    );
}

const customStyles = {
    cells: {
        style: {
            padding: '0',
        },
    },
};

const getNearTheMoneyPage = ({index, perPage}) => {
    var page = Math.ceil((index || 0) / perPage);
    return page == 0 ? 1 : page;
}

const getItems = (expirations) => expirations.map(
        e => e.dates.map((d, index) => ({date: d, expiration: e.symbol, header: index == 0 ? e.label : undefined}))
    ).flat();

const filterItem = ({strike}, filter) => {
    let result = true;

    if (filter && filter.text && strike)
        result = strike.toString().includes(filter.text);

    return result;
}    

function ConnectedMarketChain({tab, chain, expirations, dispatch}) {   
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
            title="Chains"
            open={chain.open}
            loading={chain.loading}
            onToggle={() => dispatch(ToggleMarketChain())}
        >
            <MarketChainHeader
                failed={!chain.loading && chain.failed}
                title={moment(chain.date).format("LL")}
                items={getItems(expirations)}
                onSelect={(item) => dispatch(LoadMarketChain({...tab, expiration: item.expiration, date: item.date}))}
                onReload={() => dispatch(LoadMarketChain(tab))}
                onRender={(item) => moment(item.date).format("ll")}
            />
            <BaseTable
                failed={!chain.loading && chain.failed}
                data={chain.options}
                columns={getChainTableColumns(tab, changeOrders, submitOrders)}
                subHeader={true}
                subHeaderComponent={<TableHeader/>}
                filterInit={{text: ""}}
                filterItem={filterItem}
                paginationDefaultPage={getNearTheMoneyPage(chain)}
                paginationPerPage={chain.perPage}
                onChangeRowsPerPage={(perPage) => dispatch(SetMarketChainPerPage(perPage))}
                customStyles={customStyles}
                >
            </BaseTable>
        </BaseAccordion>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
};

const MarketChain = connect(null, mapDispatchToProps)(ConnectedMarketChain);

export default MarketChain;
