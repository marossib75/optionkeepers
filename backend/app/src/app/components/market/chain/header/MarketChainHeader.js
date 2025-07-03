import React from "react";
import ButtonTitleDropdown from "../../../../commons/components/buttons/button-title-dropdown/ButtonTitleDropdown";


import "./MarketChainHeader.css";


function MarketChainHeader({title, items, onSelect, onReload, onRender, failed=false}) {
    
    return (
        <div className="app-market-chain-header">
            <ButtonTitleDropdown
                title={failed ? "Error on loading" : title}
                items={items}
                onSelect={onSelect}
                onReload={onReload}
                onRender={onRender}
            />
        </div>
    );
}

export default MarketChainHeader;
