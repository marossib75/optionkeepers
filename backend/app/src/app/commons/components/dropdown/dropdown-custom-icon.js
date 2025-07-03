import React from "react";
import {Dropdown} from "react-bootstrap"
import { BsThreeDotsVertical } from "react-icons/bs";


function CustomDropdown(props) {
    const { dropdownItems, toggleColor, style } = props;
    let {toggle, showDropdownToggle } = props;

    if (showDropdownToggle === undefined) showDropdownToggle = true;
    if (!toggle) toggle = <BsThreeDotsVertical color={toggleColor ? toggleColor : "#505e63"} size={18} />;

    return (showDropdownToggle &&
        <Dropdown style={{cursor:'pointer', marginLeft:'auto', zIndex:'1', ...style}}>
            <Dropdown.Toggle as={CustomToggle} >
                {toggle}
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight>
                {React.Children.toArray(dropdownItems.map((di) =>
                    <Dropdown.Item
                        onClick={di.onClick}
                        style={{display:'flex', alignItems: 'center', marginTop:'0.2em', color: di.type=='delete'? 'red ':'black'}}
                        disabled={di.disabled ? true : false}
                        active={di.active}
                    >
                        {di.icon}
                        <span style={{ marginLeft: "0.35rem"}} >{di.display}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <span
        ref={ref}
        onClick={e => {
            e.preventDefault();
            onClick(e);
        }}
        style={{ marginTop: "-2px" }}
    >
        {children}
    </span>
));

export default CustomDropdown;