import React from "react";
import { ListGroup, Popover } from "react-bootstrap";
import ButtonIcon from "../button-icon/ButtonIcon";
import ButtonOverlay from "../button-overlay/ButtonOverlay";

import "./ButtonIconPopover.css";

function ButtonIconPopover({items, disabled, children, placement="left", theme="dark"}){
    return (
        <ButtonOverlay
            placement={placement}
            overlay={
                <Popover id={"popover-positioned-"+placement}>
                    {
                        items &&
                        <ListGroup variant="flush">
                            {
                                items
                                .filter(item => item.show)
                                .map(item => (
                                    <ListGroup.Item key={item.label} disabled={!item.active} action onClick={item.onClick}>
                                        {item.label}
                                    </ListGroup.Item>
                                ))
                            }
                        </ListGroup>
                    }
                </Popover>
            }>
            <ButtonIcon
                disabled={disabled}
                theme={theme}
            >
                {children}
            </ButtonIcon>
        </ButtonOverlay>
    );
}

export default ButtonIconPopover;