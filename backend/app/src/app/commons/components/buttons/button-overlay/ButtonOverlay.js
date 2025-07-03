import React from "react";
import { OverlayTrigger } from "react-bootstrap";

import "./ButtonOverlay.css";

function ButtonOverlay({placement, disabled, overlay, children}) {
    return (
        <OverlayTrigger
            disabled={disabled}
            trigger="click"
            key="bottom"
            rootClose
            placement={placement}
            overlay={overlay}
        >
        {children}
        </OverlayTrigger>
    );
}

export default ButtonOverlay;
