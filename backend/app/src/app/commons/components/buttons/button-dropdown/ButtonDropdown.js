import React from "react";
import { ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";

import "./ButtonDropdown.css";

function ButtonDropdown({title, items, onRender, onSelect, variant="outline-secondary", direction="right"}) {
    return (
        <DropdownButton
            as={ButtonGroup}
            key={direction}
            id={"dropdown-button-drop-"+direction}
            drop={direction}
            variant={variant}
            title={title}
        >
            {
                (items && items.length > 0) ?
                items.map((item, index) => (
                    <div key={index}>
                        {item.header && <Dropdown.Header>{item.header}</Dropdown.Header>}
                        <Dropdown.Item 
                            disabled={item.disabled}
                            active={item.selected}
                            key={index}
                            eventKey={index}
                            onClick={() => onSelect(item)}
                            >
                            {onRender(item)}
                        </Dropdown.Item>
                    </div>
                ))
                :
                <Dropdown.Header>
                    No items
                </Dropdown.Header>
            }
        </DropdownButton>
    );
}

export default ButtonDropdown;
