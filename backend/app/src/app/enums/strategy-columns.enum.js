import React from "react";
import moment from "moment";
import { GiSightDisabled } from "react-icons/gi";

import { capitalizeFirst } from "react-stockcharts/lib/utils";
import { getCurrencyMoneyFormat } from "../utils/currency.format";
import { floatToFixed } from "../utils/string.format";

import ButtonIcon from "../commons/components/buttons/button-icon/ButtonIcon";

export const getStrategyColumns = (onToggleStrategy) => {
    const columns = [
        {
            name: "Name",
            cell: ({name}) => <div>{capitalizeFirst(name)}</div>,
        },
        {
            name: "Created at",
            cell: ({created}) => <div>{moment(created).format('lll')}</div>,
        },
        {
            name: "Group",
            cell: ({group}) => <div>{capitalizeFirst(group.name)}</div>,
        },
        {
            name: "N. Positions",
            cell: ({total}) => <div>{floatToFixed(total, 0)}</div>,
            center: true,
        },
        {
            name: "Cost",
            cell: ({group, stats}) => <div>{getCurrencyMoneyFormat(group.currency, stats.cost)}</div>,
            center: true,
        },
        {
            name: "Possible ROI",
            cell: ({group, stats}) => <div>{getCurrencyMoneyFormat(group.currency, stats.possibleROI)}</div>,
            center: true,
        },
        {
            name: "Accounted ROI",
            cell: ({group, stats}) => <div>{getCurrencyMoneyFormat(group.currency, stats.effectiveROI)}</div>,
            center: true,
        },
        {
            name: "Profit",
            cell: ({group, stats}) => <div>{getCurrencyMoneyFormat(group.currency,  stats.possibleROI - stats.cost)}</div>,
            center: true,
        },
        {
            cell: ({_id, disabled}) => <ButtonIcon active={disabled} theme="dark" fontSize={18} onClick={() => onToggleStrategy(_id, disabled)}><GiSightDisabled/></ButtonIcon>,
            center: true,
            minwidth: "40px",
            maxWidth: "40px",
        },
    ]

    return columns.filter(c => !c.hide || c.hide === "sm" )
}