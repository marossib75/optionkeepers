import { zip } from 'lodash/index';

import { ChartScaleType, ChartTemplate, ChartType } from "../../enums/chart-type.enum";

const Profit = {
    label: "Profit",
    type: ChartType.Line,
    id: ChartTemplate.Profit,
    checkRequisits: ({strategyId}) => strategyId != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data.index,
            x: data.price,
            groups: [
                {
                    id: 0,
                    title: "Profit",
                    lines:[
                        {
                            label: "At Now",
                            color: "#b30c0c",
                            id: 0,
                        },
                        {
                            label: "At Expiry",
                            color: "#6094be",
                            id: 1,
                        },
                    ],
                }
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: data.profits.map(d => ({x: d.price, y: [[d.at_now, d.at_exp]]}))
    })
};

const ProfitGreeks = {
    ...Profit,
    id: ChartTemplate.Greeks,
    checkRequisits: ({strategyId}) => strategyId != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data[0].index,
            x: data[0].price,
            groups: [
                {   
                    id: 0,
                    title: "Profit",
                    lines: [
                        {
                            label: "At Now",
                            color: "#b30c0c",
                            id: 0,
                        },
                        {
                            label: "At Expiry",
                            color: "#6094be",
                            id: 1,
                        },
                        {
                            label: "Whatif At Now",
                            color: "#b30c0c9e",
                            hide: !data[0].isWhatif,
                            id: 2,
                        },
                        {
                            label: "Whatif At Expiry",
                            color: "#6094be9e",
                            hide: !data[0].isWhatif,
                            id: 3,
                        },
                    ],
                },
                {
                    id: 1,
                    title: "Delta",
                    lines:[
                        {
                            label: "Delta",
                            color: "#f44336",
                            id: 0,
                        },
                    ],
                },{
                    id: 2,
                    title: "Gamma",
                    lines:[
                        {
                            label: "Gamma",
                            color: "#009688",
                            id: 0,
                        },
                    ],
                },{
                    id: 3,
                    title: "Theta",
                    lines:[
                        {
                            label: "Theta",
                            color: "#9c27b0",
                            id: 0,
                        },
                    ],
                },{
                    id: 4,
                    title: "Vega",
                    lines:[
                        {
                            label: "Vega",
                            color: "#673ab7",
                            id: 0,
                        },
                    ],
                },{
                    id: 5,
                    title: "Rho",
                    lines:[
                        {
                            label: "Rho",
                            color: "#ffc107",
                            id: 0,
                        },
                    ],
                },{
                    id: 6,
                    title: "Vanna",
                    lines:[
                        {
                            label: "Vanna",
                            color: "#3f51b5",
                            id: 0,
                        },
                    ],
                },{
                    id: 7,
                    title: "Vomma",
                    lines:[
                        {
                            label: "Vomma",
                            color: "#03a9f4",
                            id: 0,
                        },
                    ],
                },
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: zip(data[0].profits, data[1].greeks)
                .filter(d => d.length == 2)
                .map((d) => ({
                    x: d[0].price, 
                    y: [
                        [d[0].at_now, d[0].at_exp, d[0].at_now_wif, d[0].at_exp_wif],
                        [d[1].delta],
                        [d[1].gamma],
                        [d[1].theta],
                        [d[1].vega],
                        [d[1].rho],
                        [d[1].vanna],
                        [d[1].vomma],
                    ]
                }))
    })
};


const StrategyCharts = {
    Profit,
    ProfitGreeks,
};

export default StrategyCharts;