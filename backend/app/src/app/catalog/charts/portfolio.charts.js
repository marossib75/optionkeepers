import { ChartScaleType, ChartTemplate, ChartType } from "../../enums/chart-type.enum";

export const PortfolioPerformance = {
    label: "Performance",
    type: ChartType.Line,
    id: ChartTemplate.Performance,
    checkRequisits: ({performance}) => performance != undefined,
    getData: (data) => ({
        full: true,
        params: {
            showGrid: true,
            index: data.performance.length,
            groups: [
                {
                    id: 0,
                    title: "Performance",
                    lines:[
                        {
                            label: "Performance",
                            color: "#6094be",
                            id: 0,
                        },
                    ],
                }
            ],
            xScaleType: ChartScaleType.DateTime,
        },
        items: data.performance.map(d => ({x: new Date(d.date), y: [[d.profit]]}))
    })
};

const PortoflioCharts = {
    PortfolioPerformance,
};

export default PortoflioCharts;