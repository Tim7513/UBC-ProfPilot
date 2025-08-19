import React from 'react';
import './Button.css';

/**
 * Button Component - Presentational Component
 * Reusable button with different variants and states
 */
const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    icon = null,
    onClick,
    className = '',
    ...props
}) => {
    const buttonClass = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'btn-disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClass}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {icon && <i className={icon}></i>}
            {children && <span>{children}</span>}
        </button>
    );
};

export default Button; 