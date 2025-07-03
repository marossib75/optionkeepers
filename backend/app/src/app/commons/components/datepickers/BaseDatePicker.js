import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { InputGroup } from "react-bootstrap";

import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
import 'react-datepicker/dist/react-datepicker-cssmodules.css';

import "./BaseDatePicker.css";

const BaseDatePicker = ({label, date, dateFormat="dd LLL, y", onDateChange,}) => {
  return (
    <InputGroup className="app-input" size="sm">
        {
            label && 
            <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">{label}</InputGroup.Text>
            </InputGroup.Prepend>
        }
        <DatePicker selected={date || new Date()} dateFormat={dateFormat} onChange={onDateChange} />
    </InputGroup>
  );
};

export default BaseDatePicker;