import React from 'react';
import './Header.css';

/**
 * Header Component - Presentational Component
 * Displays the application branding and title
 */
const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <i className="fas fa-graduation-cap"></i>
                    <span>Prof Pilot</span>
                </div>
                <div className="header-subtitle">UBC Professor & Course Explorer</div>
            </div>
        </header>
    );
};

export default Header; 