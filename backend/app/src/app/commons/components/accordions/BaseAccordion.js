import React from "react";
import Loader from "react-loader-spinner";
import { Accordion, Card } from "react-bootstrap";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import LoadingOverlay from "react-loading-overlay";

import { capitalize } from "../../../utils/string.format";
import "./BaseAccordion.css";

function BaseAccordion({title, open, failed, loading, children, variant, onToggle, eventKey="0", as=Card.Header}) {
    return (
        <Accordion defaultActiveKey={open ? eventKey : ""}>
            <Card>
                <Accordion.Toggle 
                    as={as}
                    variant={variant}
                    eventKey={eventKey}
                    onClick={onToggle}
                >
                    {capitalize(title)}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={eventKey}>
                    <Card.Body>
                        <LoadingOverlay
                            active={loading}
                            spinner={<Loader className="app-accordion--loader" type="ThreeDots" color="#bbbbbb" height={100} width={100}/>}
                            fadeSpeed={0}
                        >
                            <ErrorBoundary failed={failed}>
                                {children}
                            </ErrorBoundary>
                        </LoadingOverlay>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
}

export default BaseAccordion;
