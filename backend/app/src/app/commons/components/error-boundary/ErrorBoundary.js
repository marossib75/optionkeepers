import React from "react";

import { AiOutlineStop } from "react-icons/all";


import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.log(errorInfo);
    }
  
    render() {
      if (this.state.hasError || this.props.failed) {
        // You can render any custom fallback UI
        return (
            <div className="error-boundary">
                <h4>No elements to show</h4>
                <AiOutlineStop/>
            </div>

        );
      }
      return this.props.children; 
    }
}

export default ErrorBoundary;