import React from 'react';

/**
 * ErrorState Component - Presentational Component
 * Shows error state with message
 */
const ErrorState = ({ message }) => {
    return (
        <div className="empty-state">
            <i className="fas fa-exclamation-triangle" style={{color: '#ff6b6b'}}></i>
            <h3>Search Error</h3>
            <p>{message}</p>
        </div>
    );
};

export default ErrorState; 