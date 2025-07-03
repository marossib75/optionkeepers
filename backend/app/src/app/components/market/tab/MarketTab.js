import React from "react";
import { connect } from "react-redux";

import MarketUnderlying from "../underlying/MarketUnderlying";
import MarketStrategy from "../strategy/MarketStrategy";
import MarketFuture from "../future/MarketFuture";
import MarketChart from "../chart/MarketChart";
import MarketChain from "../chain/MarketChain";
import MarketTabs from "../tabs/MarketTabs";

import { CloseMarketTab, OpenMarketTab } from "../../../state/market/market.action";

import "./MarketTab.css";

function ConnectedMarketTab({loading, tabs, tab, market, wait, dispatch}) {
    
    return (
        <div className="app-market-tab">
            {
                !loading &&
                <>
                    <MarketTabs
                        tab={tab}
                        tabs={tabs}
                        disabled={wait != 0}
                        onSelect={(item) => dispatch(OpenMarketTab(item))}
                        onClose={(item, active, next) => dispatch(CloseMarketTab(item, active, next))}/>
                    {
                        tab.open &&
                        tabs.length > 0 ?
                        <div className="app-market-tab--body">
                            <MarketUnderlying
                                tab={tab}
                                underlying={market.underlying}/>

                            <MarketChart
                                tab={tab}
                                charts={market.charts}
                                />

                            <MarketStrategy
                                tab={tab}
                                strategy={market.strategy}
                                strategies={market.strategies}
                                />

                            <MarketFuture
                                tab={tab}
                                futures={market.futures}
                                />

                            <MarketChain
                                tab={tab}
                                chain={market.chain}
                                expirations={market.expirations}
                                />
                        </div>
                        :
                        <div className="app-market-tab--empty">
                            <h4>There are no markets to display</h4>
                        </div>
                    }
                </>
            }
        
        </div>
    );
};

const mapStateToProps = ({ markets, app }) => {
    return {...markets, tabs: Object.values(markets.tabs), wait: app.wait};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const MarketTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedMarketTab)

export default MarketTab;
