import React from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { MdAdd, MdDelete, MdEdit, MdPublic, MdRefresh } from "react-icons/md";

import ButtonTitleDropdown from "../../../../commons/components/buttons/button-title-dropdown/ButtonTitleDropdown";
import { getCountryMoneyFormat } from "../../../../utils/currency.format";

import "./MarketStrategyHeader.css";

function MarketStrategyHeader({title, items, market, stats, published, onSelect, onReload, onCreate, onUpdate, onDelete, active=true}) {
    return (
        <div className="app-market-strategy-header mb-3">
            <div className="app-market-strategy-header--row">
                <ButtonTitleDropdown
                    title={title}
                    items={items}
                    disabled={items.length == 0}
                    onRender={(item) => item.name}
                    onSelect={onSelect}
                    onReload={onReload}
                    />
                 <ButtonGroup size="lg" aria-label="Basic example">
                    <Button 
                        variant="outline-primary"
                        onClick={onCreate}
                    >
                        <MdAdd/>
                    </Button>
                    {
                        active &&
                        <>
                            <Button 
                                variant="outline-primary"
                                onClick={onUpdate}
                            >
                                <MdEdit/>
                            </Button>
                            <Button 
                                variant="outline-secondary"
                                onClick={onReload}
                            >
                                <MdRefresh/>
                            </Button>
                        </>
                    }
                    
                    <Button 
                        disabled={!active}
                        variant="outline-danger"
                        onClick={onDelete}
                    >
                        <MdDelete/>
                    </Button>
                </ButtonGroup>
            </div>
            <div className="app-market-strategy-header--row">
               {
                   active &&
                        <Card.Text className={`${stats.possibleROI >= stats.cost ? "green" : "red"}`}>
                            {"" + getCountryMoneyFormat(market.country, stats.possibleROI - stats.cost)} 
                            <div className="app-market-strategy-header--published">
                                Public: 
                                <MdPublic style={{color: published? 'green': 'darkred', marginBottom:'1px', marginLeft:'5px'}}/>
                            </div>
                        </Card.Text>
                }
            </div>
        </div>
    );
}

export default MarketStrategyHeader;
