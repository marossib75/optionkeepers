import React from "react";
import moment from "moment";
import { GiSightDisabled } from "react-icons/gi";
import { MdPublic } from "react-icons/md";
import { AiOutlineStock } from "react-icons/ai";
import { BsBookmarkFill } from "react-icons/bs";
import { TiCancel } from "react-icons/ti";

import { capitalizeFirst } from "react-stockcharts/lib/utils";
import { getCurrencyMoneyFormat } from "../utils/currency.format";
import { floatToFixed } from "../utils/string.format";

import ButtonIcon from "../commons/components/buttons/button-icon/ButtonIcon";


export const getStrategyColumns2 = (onToggleStrategy) => {
    const columns = [
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
            cell: ({group, stats}) => getCurrencyMoneyFormat(group.currency,  stats.possibleROI - stats.cost)>0 ? <div style={{color:"green"}}>{getCurrencyMoneyFormat(group.currency,  stats.possibleROI - stats.cost)}</div>:<div style={{color:"red"}}>{getCurrencyMoneyFormat(group.currency,  stats.possibleROI - stats.cost)}</div>,
            center: true,
        },
        {
            cell: ({_id, disabled}) => <ButtonIcon active={disabled} theme="dark" fontSize={18} onClick={() => onToggleStrategy(_id, disabled)}><GiSightDisabled/></ButtonIcon>,
            center: true,
            minwidth: "40px",
            maxWidth: "40px",
        },
        {
            name: "Public",
            cell: ({published}) => published? <MdPublic/> : <TiCancel/>,
            center: true,
            minwidth: "50px",
            maxWidth: "50px",
        },
        {
            name: "Upvotes",
            cell: ({upvotes}) => <div>{upvotes}<AiOutlineStock/></div>,
            center: true,
            minwidth: "50px",
            maxWidth: "50px",
        },
        {
            name: "Saved",
            cell: ({bookmarks}) => <div>{bookmarks}<BsBookmarkFill/></div>,
            center: true,
            minwidth: "50px",
            maxWidth: "50px",
        },
    ]

    return columns.filter(c => !c.hide || c.hide === "sm" )
}