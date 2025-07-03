import moment from "moment";
import { ChartScaleType, ChartTemplate, ChartType } from "../../enums/chart-type.enum";

const OpenInterestBreakdown = {
    label: "O. Int. Breakdown",
    type: ChartType.Line,
    id: ChartTemplate.OpenInterestBreakdown,
    checkRequisits: ({symbol, expiration, date}) => symbol != undefined && expiration != undefined && date != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data.index,
            x: data.values[data.index].strike,
            groups: [
                {
                    id: 0,
                    title: "Breakdown",
                    lines:[
                        {
                            label: "Call",
                            color: "#f77f10",
                            id: 0,
                        },
                        {
                            label: "Put",
                            color: "#6094be",
                            id: 1,
                        },
                    ],
                }
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: data.values.map(d => ({x: d.strike, y: [[d.breakdown_call, d.breakdown_put]]}))
    })
}

const OpenInterestPressure = {
    label: "O. Int. Pressure",
    type: ChartType.Area,
    id: ChartTemplate.OpenInterestPressure,
    checkRequisits: ({symbol, expiration, date}) => symbol != undefined && expiration != undefined && date != undefined,
    getData: (data) => ({
        params: {
            showGrid: true,
            index: data.index,
            x: data.values[data.index].strike,
            lines:[
                {
                    label: "Call",
                    color: "#f77f10",
                    id: 0,
                },
                {
                    label: "Put",
                    color: "#6094be",
                    id: 1,
                },
            ],
            xScaleType: ChartScaleType.Linear,
        },
        items: data.values.map(d => ({x: d.strike, y: [d.pressure_call, d.pressure_put]}))
    })
}

const OpenInterestPerStrike = {
    label: "O. Int. Strike",
    type: ChartType.GroupedBar,
    id: ChartTemplate.OpenInterestPerStrike,
    checkRequisits: ({symbol, expiration, date}) => symbol != undefined && expiration != undefined && date != undefined,
    getData: (data) => ({
        params: {
            index: data.index,
            groups: [
                {
                    id: 0,
                    title: "Total",
                    label: "Expiration: " + moment(data.date).format("ll") + " (" + data.expiration +")",
                    bars: ["Put", "Call"],
                },
                {
                    id: 1,
                    title: "Variation",
                    label: "Variation from " + data.start + " to " + data.end,
                    bars: ["Diff Put", "Diff Call"],
                }
            ],
            xScaleType: ChartScaleType.Linear
        },
        items: data.values.map(d => ({x: d.strike, y: [[d.oiPut || 0, d.oiCall || 0], [d.oiDiffPut || 0, d.oiDiffCall || 0]]}))
    }),
}

const ChainChart = {
    OpenInterestBreakdown,
    OpenInterestPressure,
    OpenInterestPerStrike,
};

export default ChainChart;