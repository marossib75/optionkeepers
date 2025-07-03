import { ChartColor } from "../../commons/styles/colors";
import { ChartScaleType, ChartTemplate, ChartType } from "../../enums/chart-type.enum";

const History = {
    label: "History",
    type: ChartType.CandleStick,
    id: ChartTemplate.History,
    checkRequisits: ({symbol}) => symbol != undefined,
    getData: (data) => ({
        params: {},
        items: data
    })
};

const VolatilityHistory = {
    label: "Vol. History",
    type: ChartType.Line,
    id: ChartTemplate.VolatilityHistory,
    checkRequisits: ({symbol}) => symbol != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data ? data.length : 0,
            groups: [
                {
                    id: 0,
                    title: "History",
                    lines:[
                        {
                            label: "Vol 21",
                            color: "#4caf50",
                            id: 0,
                        },
                        {
                            label: "Vol 42",
                            color: "#6094be",
                            id: 1,
                        },
                        {
                            label: "Vol 63",
                            color: "#b30c0c",
                            id: 2,
                        },
                    ],
                },
            ],
            xScaleType: ChartScaleType.DateTime,
        },
        items: data.map(d => ({x: d.date, y: [[d.vol_21 || undefined, d.vol_42 || undefined, d.vol_63 || undefined]]}))
    })
};

const VolatilityVariation = {
    label: "Vol. Variation",
    type: ChartType.GroupedBar,
    id: ChartTemplate.VolatilityVariation,
    checkRequisits: ({symbol, expiration, date}) => symbol != undefined && expiration != undefined && date != undefined,
    getData: (data) => ({
        params: {
            index: data.index,
            groups: [
                {
                    id: 0,
                    title: "Variation",
                    label: "Variation from " + data.start + " to " + data.end,
                    bars: ["Put", "Call"],
                }
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: data.variations.map(d => ({x: d.strike, y: [[d.var_put, d.var_call]]})),
    })
};

const VolatilityPerStrike = {
    label: "Vol. Strike",
    type: ChartType.Line,
    id: ChartTemplate.VolatilityPerStrike,
    checkRequisits: ({symbol, expiration}) => symbol != undefined && expiration != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data.index,
            x: data.index < data.values.length ? data.values[data.index].strike : 0,
            groups: [
                {
                    id: 0,
                    title: "Strike",
                    lines: data.index < data.values.length ? 
                            data.values[data.index].lines.map((l, i) =>({label: l.label, color: ChartColor[i], id: i}))
                            :
                            [],
                }
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: data.values.map(d => ({x: d.strike, y: [d.lines.map(l => l.vol || undefined)]}))
    })
};

const OpenInterestPerExpiry = {
    label: "O. Int. Expiration",
    type: ChartType.GroupedBar,
    id: ChartTemplate.OpenInterestPerExpiry,
    checkRequisits: ({symbol, expiration}) => symbol != undefined && expiration != undefined,
    getData: (data) => ({
        params: {
            groups: [
                {
                    id: 0,
                    title: "Total",
                    label: data.expiration,
                    bars: ["Put", "Call"],
                },
                {
                    id: 1,
                    title: "Variation",
                    label: "Variation from " + data.start + " to " + data.end,
                    bars: ["Diff Put", "Diff Call"],
                }
            ],
            xScaleType: ChartScaleType.DateTime 
        },
        items: data.values.map(d => ({x: d.date, y: [[d.totPut, d.totCall], [d.diffPut, d.diffCall]]}))
    })
}

const MarketChart = {
    History,
    VolatilityHistory,
    VolatilityVariation,
    VolatilityPerStrike,
    OpenInterestPerExpiry
};

export default MarketChart;