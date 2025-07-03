import React, { useMemo, useState } from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { floatToFixed } from "../../../utils/string.format";

import "./BaseInput.css";

function BaseInput({label, input, defaultInput, fix=2, disabled, onInputChange, onInputSubmit}) {
    const [value, setValue] = useState(floatToFixed(input || defaultInput, fix));

    useMemo(() => {
        if (input == undefined) {
            setValue(floatToFixed(defaultInput, fix));
        }
        else if (input != value) {
            setValue(floatToFixed(input || defaultInput, fix));
        }
    }, [input]);

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && (value != "" || input == undefined) && onInputSubmit) {
            onInputSubmit();
        }
    }

    const onChange = (event) => {
        setValue(event.target.  value);

        if (onInputChange)
            onInputChange(event.target.value);
    };

    return (
            <InputGroup className="app-input" size="sm">
                {
                    label && 
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1">{label}</InputGroup.Text>
                    </InputGroup.Prepend>
                }
                <FormControl
                    required
                    className="text-center"
                    type="number"
                    name="quantity"
                    aria-describedby="add"
                    value={value}
                    disabled={disabled}
                    onKeyDown={onKeyDown}
                    onChange={onChange}/>
                {
                    defaultInput != undefined &&
                    input != undefined &&
                    defaultInput != input && 
                    <InputGroup.Append>
                        <Button variant="secondary" onClick={()=> onInputSubmit(defaultInput)}>x</Button>
                    </InputGroup.Append>
                }
            </InputGroup>
    );
};

export default BaseInput;
