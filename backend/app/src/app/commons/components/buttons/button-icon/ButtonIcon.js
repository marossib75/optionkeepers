import React, {useState} from "react";
import "./ButtonIcon.css";

function ButtonIcon({label, active, check, isChecked, onClick, children, disabled, theme="light", fontSize=30, border=false, style}) {
    const [checked, setChecked] = useState(isChecked || false);

    const classChecked = (!disabled && (checked || active)) ? "--checked" : "";
    const classDisabled = disabled ? "--disabled" : "";
    const classBorder = border ? "border" : "";
    return (
        <div className={"app-button-icon"
                + classDisabled
                + classChecked 
                + " " + classBorder 
                + " " + theme}
            onClick={() => {
                if (check) setChecked(!checked);
                if (!disabled)
                    onClick();
            }}
            style={{...style}}
        >
            {
                label &&
                <div className="app-button-icon--label"
                    onBlur={() => {
                        setChecked(false);
                    }}
                    style={{
                        fontSize: (fontSize-10),
                    }}
                >{label}
                </div>
            }
            <div className="app-button-icon--icon"
                onBlur={() => {
                    setChecked(false);
                }}
                style={{
                    fontSize: fontSize,
                }}
             >{children}
            </div>
        </div>
    );
}

export default ButtonIcon;
