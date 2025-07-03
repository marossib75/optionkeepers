import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getStrategyColumns } from "../../enums/strategy-columns.enum";
import { getCurrencyMoneyFormat } from "../../utils/currency.format";
import { LoadPortfolio, TogglePortfolioStrategy } from "../../state/portfolio/portfolio.action";
import BaseChart from "../../commons/components/charts/BaseChart";
import BaseTable from "../../commons/components/table/BaseTable";

import "./Portfolio.css";

function ConnectedPortfolio({portfolio, wait, dispatch}) {
    useEffect(() => {
        dispatch(LoadPortfolio());
    }, []);
    
    const {id, name, currency, value, stats, chart, charts, strategies} = portfolio;

    return (
        <div className="app-portfolio">
            <div className="app-portfolio-header">
                <div className="app-portfolio-stats">
                    <h2>{getCurrencyMoneyFormat(currency, value-stats.cost+stats.possibleROI)}</h2>
                    <br/>
                    <div className="app-portfolio-stats--info">
                        <h6>Initial: {getCurrencyMoneyFormat(currency, value)}</h6>
                        <h6>Accounted: {getCurrencyMoneyFormat(currency, value-stats.cost+stats.effectiveROI)}</h6>
                    </div>
                </div>
                <div className="app-portfolio-line"></div>
            </div>
            <div className="app-portfolio-body">
                <div className="app-portfolio-performance mb-3">
                    <BaseChart
                        chart={chart}
                        items={charts.map(chart => ({...chart, disabled: !chart.checkRequisits(stats)}))}
                        onSelect={() => {}}
                        onReload={() => {}}
                    />
                </div>
                <div className="app-portfolio-strategies mt-3">
                    <BaseTable
                        title="Strategies"
                        columns={getStrategyColumns((strategyId, disabled) => dispatch(TogglePortfolioStrategy(id, strategyId, disabled)))}
                        data={strategies || []}
                        pagination={false}
                        >
                    </BaseTable>
                </div>

            </div>
        </div>
    );
};

const mapStateToProps = ({ portfolio, app, }) => {
    return {portfolio, wait: app.wait};
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const Portfolio = connect(mapStateToProps, mapDispatchToProps)(ConnectedPortfolio)

export default Portfolio;
