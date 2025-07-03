import React from "react";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import Select from "react-select";

 //get animated components wrapper
 const animatedComponents = makeAnimated();

export const AsyncSearchBar = ({ setListToAdd, setSearch, searchFunc, optLabel, optValue, initialList=undefined}) => {

    return (
      <>
        <AsyncSelect
          cacheOptions
          isMulti
          closeMenuOnSelect={true}
          components={animatedComponents}
          getOptionLabel={(e) => e[optLabel]}
          getOptionValue={(e) => e[optValue]}
          defaultOptions={initialList !==undefined ? initialList : true}
          loadOptions={searchFunc}
          onInputChange={(value) => setSearch(value)}
          onChange={(value) => setListToAdd(value)}
        />
      </>
    );
  };
  
export const ListSearchBar = ({listInput, optLabel, optValue, setListOutput}) => {

  return(
    <>
      <Select
        closeMenuOnSelect={true}
        isMulti
        components={animatedComponents}
        options={listInput}
        getOptionLabel={(e) => e[optLabel]}
        getOptionValue={(e) => e[optValue]}
        onChange={(value) => setListOutput(value)}
      />
    </>
  )
}