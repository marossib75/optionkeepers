import React from "react";

import BaseInput from "../commons/components/inputs/BaseInput";
import { floatToFixed } from "../utils/string.format";

import { PositionOperation } from "./option-type.enum";

const getOrder = (option, quantity) => ({
    id: option.contract,
    operation: option.quantity ? PositionOperation.Update : PositionOperation.Add,
    contract: option.contract,
    quantity
});

function BaseCell({value, state}) {
    return (
        <div className={`app-market-chain--cell${state === "itm" ? "": "-bg"}`}>
            {value}
        </div>
    );
}   

export const getChainTableColumns = ({strategyId}, onChange, onSubmit) => ([
    {
        name: "Quantity",
        selector: 'call',
        center: true,
        cell: ({call}) => <BaseInput fix={0}
                                defaultInput={call.quantity}
                                input={call.quantity}
                                disabled={strategyId == undefined}
                                onInputChange={(quantity) => onChange(getOrder(call, quantity))}
                                onInputSubmit={() => onSubmit()}/>,
    },
    {
        name: "Volume",
        selector: 'call.volume',
        sortable: true,
        center: true,
        cell: ({call}) => <BaseCell value={call.volume} state={call.state} />,
        hide: "lg",
    },
    {
        name: "Open Interest",
        selector: 'call.openInterest',
        sortable: true,
        center: true,
        cell: ({call}) => <BaseCell value={call.openInterest} state={call.state} />,
        hide: "md",
    },
    {
        name: "Open - Close",
        cell: ({call}) => <BaseCell value={`${floatToFixed(call.open)} - ${floatToFixed(call.close)}`} state={call.state}></BaseCell>,
        center: true,
        hide: "lg",
    },
    {
        name: "High - Low",
        cell: ({call}) => <BaseCell value={`${floatToFixed(call.high)} - ${floatToFixed(call.low)}`} state={call.state}></BaseCell>,
        center: true,
        hide: "lg",
    },
    {
        name: "Price",
        sortable: true,
        center: true,
        cell: ({call}) => <BaseCell value={floatToFixed(call.price)} state={call.state} />,
    },
    {
        name: "Strike Price",
        selector: 'strike',
        sortable: true,
        center: true,
        cell: ({strike, put, call}) => <div className={`app-market-chain--cell ${put.quantity || call.quantity ? "selected": ""}`}>{floatToFixed(strike, 0)}</div>,
    },
    {
        name: "Price",
        sortable: true,
        center: true,
        cell: ({put}) => <BaseCell value={floatToFixed(put.price)} state={put.state} />,
    },
    {
        name: "High - Low",
        cell: ({put}) => <BaseCell value={`${floatToFixed(put.high)} - ${floatToFixed(put.low)}`} state={put.state}></BaseCell>,
        center: true,
        hide: "lg",
    },
    {
        name: "Open - Close",
        cell: ({put}) => <BaseCell value={`${floatToFixed(put.open)} - ${floatToFixed(put.close)}`} state={put.state}></BaseCell>,
        center: true,
        hide: "lg",
    },
    {
        name: "Open Interest",
        selector: 'put.openInterest',
        sortable: true,
        center: true,
        cell: ({put}) => <BaseCell value={put.openInterest} state={put.state} />,
        hide: "lg",
    },
    {
        name: "Volume",
        selector: 'put.volume',
        sortable: true,
        center: true,
        cell: ({put}) => <BaseCell value={put.volume} state={put.state} />,
        hide: "md",
    },
    {
        name: "Quantity",
        selector: 'put',
        center: true,
        cell: ({put}) => <BaseInput fix={0}
                                defaultInput={put.quantity} 
                                input={put.quantity}
                                disabled={strategyId == undefined}
                                onInputChange={(quantity) => onChange(getOrder(put, quantity))}
                                onInputSubmit={() => onSubmit()}/>,
    },
]);

