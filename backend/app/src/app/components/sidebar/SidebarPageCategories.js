import React from "react";
import { Button, Col } from "react-bootstrap";

import "./SidebarPageCategories.css"

function SidebarPageCategories({selected, elementList, title, onClick}){
    return(
        <div className="app--sidebar">
                <h4>{title}</h4>
                <div className="app--sidebar-categories">
                    {
                        elementList ? 
                            elementList.map(element =>
                                <Button 
                                    key={element.type} 
                                    className="app--sidebar-button" 
                                    active={selected === element.type} 
                                    onClick={() => onClick(element.type, '')}
                                >{element.title}</Button>
                                )
                            :
                            <>There are no categories to display</>
                    }
                </div>
        </div>
    );
};

export default SidebarPageCategories;