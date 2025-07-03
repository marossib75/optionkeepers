import React from "react";
import ButtonDropdown from "../button-dropdown/ButtonDropdown";

import "./ButtonTitleDropdown.css";

function ButtonTitleDropdown({title, items, disabled, onRender, onSelect, onReload, variant="light", direction="right"}) {
    return (
        <div className="app-button-title-dropdown">
            <div className={`app-button-title-dropdown--title ${disabled ? 'disabled' : ''}`} onClick={onReload}>
                {title}
            </div>
            <ButtonDropdown
                title={""}
                items={items}
                onRender={onRender}
                onSelect={onSelect}
                variant={variant}
                direction={direction}
            ></ButtonDropdown>
        </div>
    );
}

export default ButtonTitleDropdown;
