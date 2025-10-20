import React from 'react';
import './Header.css';

/**
 * Modern Header Component - Presentational Component
 * Displays unique UBC ProfPilot branding with distinctive design
 */
const Header = () => {
    return (
        <header className="modern-header">
            <div className="header-content">
                <div className="brand-section">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <div className="logo-symbol">
                                <div className="pilot-badge">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <div className="pilot-wings">
                                    <div className="wing-left"></div>
                                    <div className="wing-right"></div>
                                </div>
                            </div>
                        </div>
                        <div className="brand-text">
                            <h1 className="brand-title">
                                <span className="prof-text">Prof</span>
                                <span className="pilot-text">Pilot</span>
                            </h1>
                            <p className="brand-subtitle">UBC Professor & Course Intelligence</p>
                        </div>
                    </div>
                </div>
                <div className="header-decoration">
                    <div className="floating-element element-1"></div>
                    <div className="floating-element element-2"></div>
                    <div className="floating-element element-3"></div>
                    <div className="floating-element element-4"></div>
                </div>
            </div>
        </header>
    );
};

export default Header; 