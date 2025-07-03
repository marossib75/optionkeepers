import React from "react";
import { connect } from "react-redux";
import { Card, Col, Container, Row } from "react-bootstrap";

import { MarketChartCatalog } from "../../../enums/chart-catalog.enum";

import ButtonTitleDropdown from "../../../commons/components/buttons/button-title-dropdown/ButtonTitleDropdown";
import BaseAccordion from "../../../commons/components/accordions/BaseAccordion";
import BaseChart from "../../../commons/components/charts/BaseChart";

import { LoadMarketChart, ToggleMarketChart, UnloadMarketChart } from "../../../state/market/actions/market-chart.action";

import "./MarketChart.css";

function getItems(tab) {
    return MarketChartCatalog
    .map(chart => ({
        ...chart,
        label: chart.label,
        disabled: !chart.checkRequisits(tab),
        selected: chart.id in tab.charts,
    }));
}

function ConnectedMarketChart({tab, charts, dispatch}) {
    let elements = Object.values(charts.elements);
    return (
        <BaseAccordion
            title="Charts"
            open={charts.open}
            as={Card.Header}
            onToggle={() => dispatch(ToggleMarketChart())}
        >
            <div>
                <ButtonTitleDropdown
                    title="Select"
                    items={getItems(tab)}
                    onRender={(chart) => chart.label}
                    onSelect={(chart) => chart.selected ? dispatch(UnloadMarketChart(chart, tab)) : dispatch(LoadMarketChart(chart, tab))}
                />
            </div>
            { 
                charts.open &&
                elements.length > 0 ?
                <Container fluid>
                    <Row lg={1} 
                        key={elements.length <= 1 ? "unique": "multiple"}
                        xl={elements.length <= 1 ? 1 : 2}
                        className="app-market-charts-list">
                        {
                            elements
                            .map((chart) => (
                                <Col
                                    xl={elements.length <= 1 ? 12 : 6}
                                    className="app-market-charts-list--col" 
                                    key={chart.id}
                                >  
                                    <Card>
                                        <BaseChart 
                                            chart={chart}
                                            onClose={() => dispatch(UnloadMarketChart(chart, tab))}
                                            onSelect={() => dispatch(LoadMarketChart(chart, tab))}
                                            />
                                    </Card>
                                </Col>
                        ))}
                    </Row> 
                </Container>
                    :
                <div className="app-market-charts-list--empty">
                    <h4>There are no charts to display</h4>
                </div>
            }
        </BaseAccordion>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: (action) => {dispatch(action)},
    };
}

const MarketChart = connect(null, mapDispatchToProps)(ConnectedMarketChart)

export default MarketChart;
