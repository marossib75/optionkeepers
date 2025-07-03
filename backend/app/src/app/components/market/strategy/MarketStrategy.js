import React from "react";
import { connect } from "react-redux";
import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";
import MarketStrategyHeader from "./header/MarketStrategyHeader";
import MarketStrategyPositions from "./positions/MarketStrategyPositions";

import { OpenModal } from "../../../state/modal/modal.action";
import { LoadMarketStrategy, ToggleMarketStrategy, UpdateMarketStrategy } from "../../../state/market/actions/market-strategy.action";

import { ModalCatalog } from "../../../enums/modal-catalog.enum";

import "./MarketStrategy.css";

function ConnectedMarketStrategy({tab, strategy, strategies, dispatch}) {
    return (
        <>
        <BaseAccordion
            title="Positions"
            open={strategy.open}
            loading={strategy.loading}
            onToggle={() => dispatch(ToggleMarketStrategy())}
        >
            <MarketStrategyHeader
                title={strategy.name || "No strategy selected"}
                items={strategies}
                market={strategy.markets && strategy.markets.length > 0 ? strategy.markets[0] : {}}
                active={strategy.id !== undefined}
                stats={strategy.whatif.enabled ? strategy.stats.whatif : strategy.stats.original}
                published={strategy.published}
                onSelect={(item) => dispatch(LoadMarketStrategy({...tab, strategyId: item.id}))}
                onReload={() => dispatch(LoadMarketStrategy(tab))}
                onCreate={()=> dispatch(OpenModal(ModalCatalog.CreateMarketStrategy(tab)))}
                onUpdate={()=> dispatch(OpenModal(ModalCatalog.UpdateMarketStrategy(tab, strategy)))}
                onDelete={()=> dispatch(OpenModal(ModalCatalog.DeleteMarketStrategy(tab)))}
            />
            <MarketStrategyPositions
                full={tab.full}
                price={strategy.price}
                whatif={strategy.whatif}
                positions={strategy.positions}
                active={strategy.id !== undefined}
                failed={!strategy.loading && strategy.failed}
                onUpdate={(whatif, orders) => dispatch(UpdateMarketStrategy(tab, null, null, orders, whatif))}
            />
        </BaseAccordion>
        </>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
};

const MarketStrategy = connect(null, mapDispatchToProps)(ConnectedMarketStrategy);

export default MarketStrategy;
