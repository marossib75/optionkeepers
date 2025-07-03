import React from "react";
import moment from "moment";

import BaseInput from "../commons/components/inputs/BaseInput";

import { PositionOperation, PositionStatus } from "./option-type.enum";
import { floatToFixed } from "../utils/string.format";

const getOrder = (future, quantity) => ({
    id: future.contract,
    operation: future.quantity ? PositionOperation.Update : PositionOperation.Add,
    contract: future.contract,
    quantity
});

export const getFutureTableColumns = ({strategyId}, onChange, onSubmit) => ([
    {
        name: "Quantity",
        selector: 'quantity',
        center: true,
        cell: (future) => <BaseInput fix={0} input={future.quantity} disabled={strategyId == undefined}
                                    onInputChange={(quantity) => onChange(getOrder(future, quantity))}
                                    onInputSubmit={() => onSubmit()}/>,
    },
    {
        name: "Expiration",
        selector: 'date',
        sortable: true,
        center: true,
        cell: ({expiration, date}) => <div>{expiration} {moment(date).format("ll")}</div>,
    },
    {
        name: "Price",
        cell: ({price}) => <div>{floatToFixed(price)}</div>,
        sortable: true,
        center: true,
    },
    {
        name: "Open price",
        cell: ({open}) => <div>{floatToFixed(open)}</div>,
        sortable: true,
        center: true,
        hide: "md",
    },
    {
        name: "Close price",
        cell: ({close}) => <div>{floatToFixed(close)}</div>,
        sortable: true,
        center: true,
        hide: "md",
    },
    {
        name: "High price",
        cell: ({high}) => <div>{floatToFixed(high)}</div>,
        sortable: true,
        center: true,
        hide: "lg",
    },
    {
        name: "Low price",
        cell: ({low}) => <div>{floatToFixed(low)}</div>,
        sortable: true,
        center: true,
        hide: "lg",
    },
    {
        name: "Open Interest",
        cell: ({openInterest}) => <div>{floatToFixed(openInterest)}</div>,
        sortable: true,
        center: true,
        hide: "sm",
    },
    {
        name: "Volume",
        cell: ({volume}) => <div>{floatToFixed(volume)}</div>,
        sortable: true,
        center: true,
        hide: "sm,"
    },
]);

