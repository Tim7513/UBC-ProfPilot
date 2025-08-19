import React from 'react';
import './InputField.css';

/**
 * InputField Component - Presentational Component
 * Reusable input field with label, validation, and help text
 */
const InputField = ({
    label,
    type = 'text',
    value,
    onChange,
    onKeyPress,
    placeholder = '',
    required = false,
    disabled = false,
    error = null,
    helpText = null,
    className = '',
    ...props
}) => {
    const inputClass = [
        'input-field-control',
        error && 'input-error',
        disabled && 'input-disabled',
        className
    ].filter(Boolean).join(' ');

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className="input-field">
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="required-indicator">*</span>}
                </label>
            )}
            
            <input
                type={type}
                value={value}
                onChange={handleChange}
                onKeyPress={onKeyPress}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={inputClass}
                {...props}
            />
            
            {error && (
                <div className="input-error-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}
            
            {helpText && !error && (
                <div className="input-help-text">
                    {helpText}
                </div>
            )}
        </div>
    );
};

export default InputField; 