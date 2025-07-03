import React from "react";

function ButtonElement(props) {
    const {text, children, style, onClick, ...otherProps } = props;

    return (
        <div
            className="my-2"
            style={{marginRight:'0.5em', padding:'0.5em', borderStyle:'outset', borderColor:'#e6e6e6', borderRadius: "5px", color:'black',
                    display:'flex', alignItems:'center', justifyContent:'center', maxWidth:'fit-content', ...style}}
            {...otherProps}
        >
            {text && <div style={{cursor:'pointer'}} onClick={onClick} >{text}</div>}
            {React.Children.toArray(children)}
        </div>
    );
}

export default ButtonElement;
