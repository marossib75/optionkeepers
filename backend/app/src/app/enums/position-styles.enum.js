import { PositionStatus } from "./option-type.enum";

export const positionStatusCellStyles = [
    {
        when: row => row.status === PositionStatus.Open,
        style: {
            backgroundColor: '#387bfe',
            color: 'white',
            padding: "3px",
        },
    },
    {
        when: row => row.status === PositionStatus.Close,
        style: {
            backgroundColor: '#ffffff',
            color: 'white',
            padding: "3px",
        },
    },
    {
        when: row => row.status === PositionStatus.Temporary,
        style: {
            backgroundColor: '#bdbdbd',
            color: 'white',
            padding: "3px",
        },
    }
]

export const positionProfitCellStyles = [
    {
        when: ({status, cost, effectiveROI, possibleROI}) =>
            (status === PositionStatus.Close && cost <= effectiveROI) ||
            (status === PositionStatus.Open && cost <= possibleROI),
        style: {
            color: '#81c784',
        },
    },
    {
        when: ({status, cost, effectiveROI, possibleROI}) =>
            (status === PositionStatus.Close && cost > effectiveROI) ||
            (status === PositionStatus.Open && cost > possibleROI),
        style: {
            color: '#ec407a',
        },
    },
]

export const positionCostCellStyles = [
    {
        when: ({cost, status}) => status !== PositionStatus.Temporary && cost <= 0,
        style: {
            color: '#81c784',
        },
    },
    {
        when: ({cost, status}) => status !== PositionStatus.Temporary && cost > 0,
        style: {
            color: '#ec407a',
        },
    },
]

export const positionRowStyles = [
    {
    when: row => !row.active,
        style: {
            color: '#bdbdbd',
        },
    },
];