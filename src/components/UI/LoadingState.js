import React from 'react';
import './LoadingState.css';

/**
 * LoadingState Component - Presentational Component
 * Shows a loading spinner with optional message
 */
const LoadingState = ({ message = 'Loading...' }) => {
    return (
        <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{message}</p>
        </div>
    );
};

export default LoadingState; 