import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Accordion, Form } from "react-bootstrap";

import { LoadMarkets, OpenMarketTab } from "../../../state/market/market.action";
import BaseListGroup from "../../../commons/components/list-groups/BaseListGroup";
import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";

import "./MarketSearch.css";

function ConnectedMarketSearch({search, results, tab, tabs, wait, dispatch}) {
    useEffect(()=> dispatch(LoadMarkets(search)), []);

    return (
        <div className="app-market-search">
            <Form className="app-market-search--form">
                <Form.Group controlId="searchForm">
                    <Form.Control
                        type="text"
                        value={search}
                        placeholder="Search"
                        onChange={(event) => dispatch(LoadMarkets(event.target.value))}
                    />
                </Form.Group>
            </Form>
            <div className="app-market-search--result">
                <div className="app-market-search--result-body">
                    {
                        results.map((result, idx) => (
                            <BaseAccordion
                                key={idx}
                                as={Accordion.Header}
                                title={result.template}
                            >
                                <BaseListGroup
                                    variant="flush"
                                    items={result.markets
                                        .sort((a,b) => b.symbol-a.symbol)
                                        .map(result => ({
                                            key: result.symbol,
                                            label: result.label,
                                            active: result.symbol === tab.symbol,
                                            selected: result.symbol in tabs,
                                            disabled: wait != 0,
                                            onSelect: (selected) => dispatch(OpenMarketTab(selected ? tabs[result.symbol] : result))
                                        }))
                                    }
                                >
                                </BaseListGroup>
                            </BaseAccordion>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ markets, app }) => {
    return {...markets, wait: app.wait };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const MarketSearch = connect(mapStateToProps, mapDispatchToProps)(ConnectedMarketSearch)

export default MarketSearch;
