import React from 'react';

/**
 * EmptyState Component - Presentational Component
 * Shows empty state with icon, title, and message
 */
const EmptyState = ({ icon, title, message }) => {
    return (
        <div className="empty-state">
            <i className={icon}></i>
            <h3>{title}</h3>
            <p>{message}</p>
        </div>
    );
};

export default EmptyState; 