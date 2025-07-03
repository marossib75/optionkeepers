import React, { useState } from "react";
import moment from "moment";
import { ButtonGroup, Card, ToggleButton } from "react-bootstrap";

import BaseAccordion from "../../../../commons/components/accordions/BaseAccordion";
import BaseTable from "../../../../commons/components/table/BaseTable";
import BaseInput from "../../../../commons/components/inputs/BaseInput";

import { getPastPositionColumns, getCurrentPositionColumns } from "../../../../enums/position-columns.enum";
import { positionRowStyles } from "../../../../enums/position-styles.enum";
import { PositionOperation, PositionStatus } from "../../../../enums/option-type.enum";

import "./MarketStrategyPositions.css";

const filterItem = (item, filter) => {
    var passed = true;

    if (filter && filter.text && item) {
        passed = false;

        Object.keys(item).forEach(key =>{
            var value =  item[key]
            passed = value ? JSON.stringify(value).toLowerCase().includes(filter.text.toLowerCase()) || passed : passed;
        });
    } 
    return passed;
}

const getStartFromDate = (date, minDate) =>  minDate.subtract(date, 'day').format("YYYY-MM-DD")

function Control({price, positions, whatif, onUpdate}) {
    var {
        startFromDate,
        underlyingPrice,
        volatilityStep,
        volatilityIncrease,
        enabled,
    } = whatif || {}

    var startDate = moment(startFromDate);
    var minExpiration = positions && positions.length > 0 ? moment.min(positions.map(p => moment(p.date))) : moment();
    
    const [config, setConfig] = useState({startFromDate, underlyingPrice, volatilityStep, volatilityIncrease});
    
    const onIncrease = (config) => {
        var increment = config.volatilityIncrease * config.volatilityStep / 100

        if (increment >= 0) {
            var orders = positions.map(position => ({
                id: position.id,
                contract: position.contract,
                operation: PositionOperation.Update,
                whatif: {volatility: Number(position.volatility) + Number(increment)}
            }));
            setConfig(config);
            onUpdate({...whatif, ...config}, orders);
        }
    };

    const onSumbit = (config) => {
        setConfig(config);
        onUpdate({...whatif, ...config}, []);
    }

    return (
        <div className="app-market-strategy-positions--control">
            {
                enabled &&
                <div className="app-market-strategy-positions--control-input">
                    <BaseInput 
                        label="Days to Expiration"
                        fix={0} 
                        input={minExpiration.diff(startDate, 'days')}
                        defaultInput={minExpiration.diff(moment(), 'days')+1}
                        onInputChange={(value) => setConfig({...config, startFromDate: getStartFromDate(value, minExpiration)})}
                        onInputSubmit={(value) => !value ? onSumbit(config) : onSumbit({...config, startFromDate: getStartFromDate(value, minExpiration)})}/>
                    <BaseInput 
                        label="Underlying Price" 
                        input={underlyingPrice || price} 
                        defaultInput={price}
                        onInputChange={(underlyingPrice) => setConfig({...config, underlyingPrice})}
                        onInputSubmit={(underlyingPrice) => !underlyingPrice ? onSumbit(config) : onSumbit({...config, underlyingPrice})}/>

                    <BaseInput 
                        label="V. Step %"
                        input={(volatilityStep || 0)}
                        onInputChange={(volatilityStep) => setConfig({...config, volatilityStep})}
                        onInputSubmit={() => onIncrease(config)}/>

                    <BaseInput
                        label="V. Increase" 
                        fix={0}
                        input={volatilityIncrease || 0}
                        onInputChange={(volatilityIncrease) => setConfig({...config, volatilityIncrease})}
                        onInputSubmit={() => onIncrease(config)}/>
                </div>
            }
            <div className="app-market-strategy-positions--control-submit">
                <ButtonGroup toggle>
                    <ToggleButton
                    size="sm"
                    type="checkbox"
                    variant="outline-secondary"
                    checked={enabled}
                    value="1"
                    onChange={(e) => onUpdate({...whatif, enabled: e.currentTarget.checked}, [])}
                    >
                    What if?
                    </ToggleButton>
                </ButtonGroup>
            </div>

        </div>
    );
}

function MarketStrategyPositions({price, full, active, failed, whatif, positions, onUpdate}) {
    const [orders, setOrders] = useState({});

    const changeOrders = (order) => {
        orders[order.id] = {...orders[order.id], ...order};
        setOrders(orders);
    };

    const submitOrders = (order=undefined) => {

        if (order !== undefined)
            orders[order.id] = {...orders[order.id], ...order};

        let submits = [];

        positions.forEach(position => {

            if (position.id in orders) {
                let order = orders[position.id];
                
                if (order.quantity != 0) {
                    submits.push(order);
    
                    if ((order.status != position.status || order.operation === PositionOperation.Delete)
                            && Math.abs(order.quantity) < Math.abs(position.quantity)) {
                        submits.push({...order, operation: PositionOperation.Add, status: position.status, quantity: position.quantity - order.quantity});
                    }
                }
            }
        });
        if (submits.length > 0) {
            onUpdate(whatif, submits);
        }
        setOrders({})
    };

    return (
        <div className="app-market-strategy-positions">
            {
                active &&
                positions.length > 0 &&
                <Control
                    price={price}
                    whatif={whatif}
                    positions={positions || []}
                    onUpdate={(whatif, orders) => onUpdate(whatif, orders)}
                />
            }
            <BaseAccordion
                title="Current"
                as={Card.Link}
                open={true}
                failed={failed}
            >
                <BaseTable
                    columns={getCurrentPositionColumns(full, whatif, changeOrders, submitOrders)}
                    positionRowStyles={positionRowStyles}
                    data={positions.filter(p => p.status !== PositionStatus.Close)}
                    filterInit={{text: ""}}
                    filterItem={filterItem}
                    pagination={false}
                    >
                </BaseTable>
            </BaseAccordion>
            <BaseAccordion
                title="Past"
                as={Card.Link}
                failed={failed}
            >
                <BaseTable
                    columns={getPastPositionColumns(full, whatif, changeOrders, submitOrders, false)}
                    positionRowStyles={positionRowStyles}
                    data={positions.filter(p => p.status === PositionStatus.Close).sort((a,b) => a.id.localeCompare(b.id))}
                    filterInit={{text: ""}}
                    filterItem={filterItem}
                    pagination={false}
                    >
                </BaseTable>
            </BaseAccordion>
        </div>
    );
}

export default MarketStrategyPositions;
