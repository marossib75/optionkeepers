import React from "react";
import { Spinner, Tab, Tabs } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";

import "./MarketTabs.css";


const MarketTabTitle = ({title, loading, onSelect, onClose}) => (
    <div className="app-market-tab--tab-title">
        {loading &&
            <div className="app-market-tab--tab-spinner">
                <Spinner size="sm" animation="border" variant="secondary"/>
            </div>
        }
        <div className="app-market-tab--tab-title-open" onClick={onSelect}>
            {title}
        </div>
        <div className="app-market-tab--tab-title-close" >
            <AiOutlineClose onClick={onClose}/>
        </div>
    </div>
);

const nextTab = (tabs, index) => (
    tabs[index < tabs.length-1 ? index + 1 : index - 1]
);

const MarketTabs = ({tab, tabs, disabled, onSelect, onClose}) => {
    return (
        <>
            {
                tabs &&
                tabs.length > 0 &&
                <Tabs activeKey={tab.symbol}>
                {   
                    tabs.map((item, index) => (
                        <Tab
                            disabled={disabled}
                            key={item.symbol}
                            eventKey={item.symbol}
                            title={<MarketTabTitle
                                        title={item.label}
                                        loading={item.symbol == tab.symbol && disabled}
                                        onSelect={() => onSelect(item)}
                                        onClose={() => onClose(item, tab, nextTab(tabs, index))}
                                    />}
                        />
                    ))
                }
                </Tabs>
            }
        </>
    );
}

export default MarketTabs;
