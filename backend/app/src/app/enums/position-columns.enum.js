import React from "react";
import moment from "moment";
import { HiOutlineDotsVertical } from "react-icons/hi";

import BaseInput from "../commons/components/inputs/BaseInput";
import ButtonIconPopover from "../commons/components/buttons/button-icon-popover/ButtonIconPopover";

import { PositionOperation, PositionStatus } from "./option-type.enum";

import { positionCostCellStyles, positionProfitCellStyles, positionStatusCellStyles } from "./position-styles.enum";
import { getCurrencyMoneyFormat } from "../utils/currency.format";
import { floatToFixed, floatToPercentage } from "../utils/string.format";

const getItems = (position, onSubmit, whatif={}) => [
    {
        show: position.status === PositionStatus.Temporary,
        label: "Open",
        active: position.active && position.quantity != 0 && !whatif.enabled,
        onClick: () => onSubmit({...position, status: PositionStatus.Open})
    },
    {
        show: position.status === PositionStatus.Temporary || whatif.enabled,
        label: !whatif.enabled ? (position.active ? "Deactive" : "Active") : (position.whatif.active ? "Deactive" : "Active") ,
        active: true,
        onClick: () => onSubmit({...position, active: !position.active, whatif: {active: !position.whatif.active}})
    },
    {
        show: true,
        label: "Delete",
        active: true,
        onClick: () => onSubmit({...position, operation: PositionOperation.Delete})
    },
    {
        show: position.status === PositionStatus.Open,
        label: "Close",
        active: position.quantity != 0 && !whatif.enabled,
        onClick: () => onSubmit({...position, status: PositionStatus.Close})
    }
];

const getOrder = (position) => ({
    id: position.id,
    active: position.active,
    status: position.status,
    contract: position.contract,
    operation: position.operation || PositionOperation.Update,
    whatif: position.whatif,
});

export const getCurrentPositionColumns = (full, whatif={}, onChange, onSubmit) => {
    const columns = [
        {
            name: "",
            cell: (position) => <ButtonIconPopover
                                    items={getItems(position, position => onSubmit(getOrder(position)), whatif)}
                                >
                                    <HiOutlineDotsVertical/>
                                </ButtonIconPopover>,
            width: "40px",
            maxWidth: "40px",
        },
        {
            name: "Quantity",
            center: true,
            cell: (position) => whatif.enabled || position.status !== PositionStatus.Close ?
                                    <BaseInput
                                        fix={0}
                                        defaultInput={position.quantity}
                                        input={!whatif.enabled ? position.quantity : position.whatif.quantity}
                                        disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                        onInputChange={(quantity) => onChange({...getOrder(position), quantity, whatif:{quantity}})}
                                        onInputSubmit={(quantity) => !quantity ? onSubmit() : onSubmit({...getOrder(position), whatif:{quantity}})}/>
                                    : 
                                    <div>{position.quantity}</div>,
        },
        {
            name: "Market",
            selector: 'label',
            sortable: true,
            center: true,
        },
        {
            name: "Expiration",
            cell: ({expiration, date}) => <div>{expiration} {moment(date).format("ll")}</div>,
            center: true,
        },
        {
            name: "Strike",
            cell: ({type, strike}) => <div>{(type || "").toUpperCase()} {(strike || "")}</div>,
            center: true,
        },
        {
            name: "Open Interest",
            selector: 'openInterest',
            sortable: true,
            center: true,
        },
        {
            name: "Volume",
            selector: 'volume',
            sortable: true,
            center: true,
            hide: "lg"
        },
        {
            name: "Volatility",
            cell: (position) => whatif.enabled ?
                                <BaseInput
                                    fix={4}
                                    defaultInput={position.volatility}
                                    input={position.whatif.volatility}
                                    disabled={!position.whatif.active}
                                    onInputChange={(volatility) => onChange({...getOrder(position), whatif:{volatility: volatility}})}
                                    onInputSubmit={(volatility) => !volatility ? onSubmit() : onSubmit({...getOrder(position), whatif:{volatility: volatility}})}/>
                                :
                                <div>{floatToPercentage(position.volatility, 2)} %</div>,
            center: true,
            hide: "lg"
        },
        {
            name: "Time value",
            cell: (position) => <div>{floatToFixed(position.timeValue, 2)}</div>,
            center: true,
            hide: "lg"
        },
        {
            name: "Last Price",
            cell: (position) => whatif.enabled ?
                                <BaseInput
                                    defaultInput={position.price}
                                    input={!whatif.enabled ? position.price : position.whatif.price}
                                    disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                    onInputChange={(price) => onChange({...getOrder(position), whatif: { price }})}
                                    onInputSubmit={(price) => !price ? onSubmit() : onSubmit({...getOrder(position), whatif: { price }})}/>
                                    :
                                    <div>{floatToFixed(position.price)}</div>,
            center: true,
        },
        {
            name: "Start price",
            cell: (position) => <BaseInput
                                    defaultInput={position.startPrice}
                                    input={!whatif.enabled ? position.startPrice : position.whatif.startPrice}
                                    disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                    onInputChange={(startPrice) => onChange({...getOrder(position), startPrice, whatif: { startPrice }})}
                                    onInputSubmit={(startPrice) => !startPrice ? onSubmit() : onSubmit({...getOrder(position),  whatif: { startPrice }})}/>,
            center: true,
        },
        {
            name: "Cost",
            cell: ({currency, cost}) => <div>{getCurrencyMoneyFormat(currency, cost)}</div>,
            center: true,
            hide: "sm",
            conditionalCellStyles: positionCostCellStyles,
        },
        {
            name: "Profit",
            cell: ({currency, cost, possibleROI}) => <div>{getCurrencyMoneyFormat(currency, possibleROI - cost)}</div>,
            center: true,
            conditionalCellStyles: positionProfitCellStyles,
            hide: "md",
        },
        {
            name: "",
            maxWidth: "5px",
            minWidth: "5px",
            conditionalCellStyles: positionStatusCellStyles,
            center: true,
        },
    ]
    return columns.filter(c => full || !c.hide || c.hide === "sm" )
}


export const getPastPositionColumns = (full, whatif={}, onChange, onSubmit, readOnly) => {
    const columns = [
        {
            name: "",
            cell: (position) => !readOnly  ? <ButtonIconPopover
                                                items={getItems(position, position => onSubmit(getOrder(position)), whatif)}
                                            >
                                                <HiOutlineDotsVertical/>
                                            </ButtonIconPopover>
                                            : <div></div>,
            width: readOnly ? "0px" : "40px",
            maxWidth: readOnly ? "0px" : "40px",
        },
        {
            name: "Quantity",
            cell: (position) => whatif.enabled && !readOnly ?
                                <BaseInput
                                    fix={0}
                                    defaultInput={position.quantity}
                                    input={!whatif.enabled ? position.quantity : position.whatif.quantity}
                                    disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                    onInputChange={(quantity) => onChange({...getOrder(position), whatif:{quantity}})}
                                    onInputSubmit={(quantity) => !quantity ? onSubmit() : onSubmit({...getOrder(position), whatif:{quantity}})}/>
                                :
                                <div>{position.quantity}</div>,
            center: true,
        },
        {
            name: "Market",
            selector: 'label',
            sortable: true,
            center: true,
        },
        {
            name: "Expiration",
            cell: ({expiration, date}) => <div>{expiration} {moment(date).format("ll")}</div>,
            center: true,
        },
        {
            name: "Strike",
            cell: ({type, strike}) => <div>{(type || "").toUpperCase()} {(strike || "")}</div>,
            center: true,
        },
        {
            name: "Start price",
            cell: (position) =>  whatif.enabled && !readOnly ?
                                    <BaseInput
                                        defaultInput={position.startPrice}
                                        input={!whatif.enabled ? position.startPrice : position.whatif.startPrice}
                                        disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                        onInputChange={(startPrice) => onChange({...getOrder(position), whatif:{startPrice}})}
                                        onInputSubmit={(startPrice) => !startPrice ? onSubmit() : onSubmit({...getOrder(position), whatif:{startPrice}})}/>
                                        :
                                        <div>{floatToFixed(position.startPrice)}</div>,
            center: true,
        },
        {
            name: "End price",
            cell: (position) => position.status === PositionStatus.Close && whatif.enabled && !readOnly ?
                                    <BaseInput
                                        defaultInput={position.endPrice}
                                        input={!whatif.enabled ? position.endPrice : position.whatif.endPrice}
                                        disabled={!whatif.enabled ? !position.active : !position.whatif.active}
                                        onInputChange={(endPrice) => onChange({...getOrder(position), whatif:{endPrice}})}
                                        onInputSubmit={(endPrice) => !endPrice ? onSubmit() : onSubmit({...getOrder(position), whatif:{endPrice}})}/>
                                    :
                                    <div>{floatToFixed(position.endPrice)}</div>,
            center: true,
        },
        {
            name: "Start date",
            cell: (position) => <div>{moment(position.startDate).format("lll")}</div>,
            center: true,
            hide: "lg"
        },
        {
            name: "End date",
            cell: (position) => position.endDate ? <div>{moment(position.endDate).format("lll")}</div> : "",
            center: true,
            hide:"lg"
        },
        {
            name: "Cost",
            cell: ({currency, cost}) => <div>{getCurrencyMoneyFormat(currency, cost)}</div>,
            center: true,
            hide: "sm",
            conditionalCellStyles: positionCostCellStyles,
        },
        {
            name: "Profit",
            cell: ({currency, cost, effectiveROI}) => <div>{getCurrencyMoneyFormat(currency, effectiveROI - cost)}</div>,
            center: true,
            conditionalCellStyles: positionProfitCellStyles,
        },
    ]
    return columns.filter(c => full || !c.hide || c.hide === "sm" )
};

export const getPositionColumns = (full, onChange, onSubmit, readOnly) => {
    const columns = [
        {
            cell: (position) => position.status !== PositionStatus.Close && !readOnly?
                                <ButtonIconPopover items={getItems(position, position => onSubmit(getOrder(position)))}>
                                    <HiOutlineDotsVertical/>
                                </ButtonIconPopover>
                                : 
                                <div></div>,
            width: readOnly ? "0px" : "40px",
            maxWidth: readOnly ? "0px" : "40px",
        },
        {
            name: "Quantity",
            cell: (position) => position.status === PositionStatus.Temporary && !readOnly ?
                                <BaseInput 
                                    fix={0}
                                    input={position.quantity}
                                    disabled={!position.active}
                                    onInputChange={(quantity) => onChange({...getOrder(position), quantity})}
                                    onInputSubmit={() => onSubmit()}/>
                                    :
                                    <div>{position.quantity}</div>,
            center: true,
        },
        {
            name: "Market",
            selector: "label",
        },
        {
            name: "Expiration",
            cell: ({expiration, date}) => <div>{expiration} {moment(date).format("ll")}</div>,
        },
        {
            name: "Strike",
            cell: ({type, strike}) => <div>{(type || "").toUpperCase()} {(strike || "")}</div>,
            center: true,

        },
        {
            name: "Volatility",
            cell: ({volatility}) => <div>{floatToPercentage(volatility)} %</div>,
            center: true,
            hide:"md",
            minWidth: "3vw",
            maxWidth: full ? "6vw": "3vw",
        },
        {
            name: "Time value",
            cell: (position) => <div>{floatToFixed(position.timeValue, 2)}</div>,
            center: true,
            hide: "md",
            minWidth: "3vw",
            maxWidth: full ? "6vw": "3vw",
        },
        {
            name: "Last Price",
            cell: ({price}) => <div>{floatToFixed(price)}</div>,
            sortable: true,
            center: true,
            hide: "sm",
        },
        {
            name: "Start price",
            cell: ({startPrice}) => <div>{floatToFixed(startPrice)}</div>,
            sortable: true,
            center: true,
        },
        {
            name: "Start date",
            cell: (position) => <div>{moment(position.startDate).format("lll")}</div>,
            center: true,
            hide: "lg"
        },
        {
            name: "",
            minWidth: "1px",
            maxWidth: "1px",
            conditionalCellStyles: positionStatusCellStyles,
        },
    ]
    return columns.filter(c => full || !c.hide || c.hide === "sm" )
}