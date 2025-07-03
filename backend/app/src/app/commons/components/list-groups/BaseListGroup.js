import React from "react";

import { ListGroup } from "react-bootstrap";

import "./BaseListGroup.css";

function BaseListGroup({items, as="ul", itemAs="li", variant=undefined}) {
    return (
        <div className="app-list-group">
            <div className="app-list-group--items">
                <ListGroup variant={variant} as={as}>
                {
                    items &&
                    items.map((item) => (
                        <ListGroup.Item
                            key={item.key}
                            active={item.active}
                            className={item.selected ? "app-list-group--item-selected" : ""}
                            disabled={item.disabled}
                            as={itemAs}
                            action
                            onClick={() => item.onSelect(item.selected)}
                        >
                            {item.label ? item.label : item.children()}
                        </ListGroup.Item>
                    ))
                }
                </ListGroup>
            </div>
        </div>
    );
};
export default BaseListGroup;
