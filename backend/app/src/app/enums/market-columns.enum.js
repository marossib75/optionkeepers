import React from "react";
import { VscLinkExternal } from "react-icons/vsc";

import { capitalizeFirst } from "react-stockcharts/lib/utils";
import ButtonIcon from "../commons/components/buttons/button-icon/ButtonIcon";
import { floatToFixed } from "../utils/string.format";

export const getMarketColumns = (full, readOnly, onMarketOpen) => {
    const columns = [
        {
            name: "Name",
            cell: (market) => <div>{capitalizeFirst(market.label)}</div>,
        },
        {
            name: "Template",
            cell: ({template}) => <div>{capitalizeFirst(template)}</div>,
            hide: "sm",
        },
        {
            name: "Price",
            cell: ({underlying}) => <div>{floatToFixed(underlying.price)}</div>,
            center: true,
        },
        {
            name: "Open - Close",
            cell: ({underlying}) => <div>{floatToFixed(underlying.open)} - {floatToFixed(underlying.close)}</div>,
            hide: "md",
            center: true,

        },
        {
            name: "High - Low",
            cell: ({underlying}) => <div>{floatToFixed(underlying.high)} - {floatToFixed(underlying.low)}</div>,
            hide: "md",
            center: true,
        },
        {
            name: "Volume",
            cell: ({underlying}) => <div>{floatToFixed(underlying.volume)}</div>,
            center: true,
            hide: "sm",
        },
        {
            name: "OpenInterest",
            cell: ({underlying}) => <div>{floatToFixed(underlying.openInterest)}</div>,
            center: true,
            hide: "sm",
        },
        {
            cell: (market) => <ButtonIcon theme="dark" disabled={readOnly} fontSize={16} onClick={() => onMarketOpen(market)}><VscLinkExternal/></ButtonIcon>,
            center: true,
            minWidth: "40px",
            maxWidth: "40px",
        }
    ]

    return columns.filter(c => full || !c.hide || c.hide === "sm")
}