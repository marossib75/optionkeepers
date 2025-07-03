import React, { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { FormControl, InputGroup } from 'react-bootstrap';

import ErrorBoundary from '../error-boundary/ErrorBoundary';

import "./BaseTable.css";

const baseCustomStyle = {
  rows: {
    style: {
      height: '40px', // override the row height
      minHeight: '40px',
      maxHeight: '40px',
    }
  },
  headCells: {
    style: {
      paddingLeft: '8px', // override the cell padding for head cells
      paddingRight: '8px',
      maxWidth: '8vw',
      textAlignment: 'center',
    },
  },
  cells: {
      style: {
          paddingTop: '0',
          paddingBottom: '0',
          paddingLeft: '8px',
          paddingRight: '8px',
          maxWidth: '8vw',
      },
  },
};

function TextFilterComponent({text, disabled, onChange, onClear}) {
  const [value, setValue] = useState(text);

  useMemo(() => {
    if (text !== value) {
      setValue(text);
    }
  }, [text]);

  return (
      <InputGroup size="sm">
        <FormControl
          type="text"
          placeholder="Search"
          aria-label="Search" 
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-describedby="basic-addon2"
        />
      </InputGroup>
    );
}

function BaseTable({
    title,
    data,
    columns,
    subHeader,
    subHeaderComponent,
    filterInit,
    filterItem,
    pagination=true,
    paginationDefaultPage=1,
    paginationPerPage=10,
    onChangeRowsPerPage,
    customStyles={},
    failed=false,
    conditionalRowStyles,
  }) {
  const [filter, setFilter] = React.useState(filterInit);
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  
  useMemo(()=> {
    if (filter && filter.text === "") {
      setResetPaginationToggle(!resetPaginationToggle);
    }
  }, [filter])

  const filteredData = filter ? data.filter(item => filterItem(item, filter)) : data;

  return (
    <div className="app-table">
      <ErrorBoundary
        failed={failed}
      >
        {
          title &&
          <div className="app-table-title mb-2">
            {title}
          </div>
        }
        {
          filter &&
          data.length > 0 &&
          <div className="app-table-filter mb-2">
            <div className="app-table-filter--row mb-2">
              <TextFilterComponent onChange={(text) => setFilter({...filter, text})} filter={filter.text} />
            </div>
          </div>
        } 
        {
            data.length > 0 ? 
            <DataTable
              data={filteredData}
              columns={columns}
              noHeader={true}
              dense={true}
              responsive={true}
              pagination
              persistTableHead
              subHeader={subHeader}
              subHeaderComponent={subHeaderComponent}
              pagination={pagination}
              paginationPerPage={paginationPerPage}
              paginationDefaultPage={paginationDefaultPage}
              onChangeRowsPerPage={onChangeRowsPerPage}
              paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
              customStyles={{...baseCustomStyle, ...customStyles}}
              conditionalRowStyles={conditionalRowStyles}
            />
            :
            <div className="app-table-empty">
              <h4>
              There are no records to display
              </h4>
            </div>
        }
        
      </ErrorBoundary>
    </div>
  );
};

export default BaseTable;