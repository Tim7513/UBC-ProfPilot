import React from 'react';
import InputField from '../UI/InputField';
import './ProfessorSearchForm.css';

/**
 * ProfessorSearchForm Component - Presentational Component
 * Form fields for professor search (first name, last name, university)
 */
const ProfessorSearchForm = ({ data, onChange, onKeyPress }) => {
    const handleInputChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="search-form professor-search-form">
            <div className="input-group">
                <InputField
                    label="First Name"
                    type="text"
                    value={data.firstName}
                    onChange={(value) => handleInputChange('firstName', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., John"
                    required
                />
                
                <InputField
                    label="Last Name"
                    type="text"
                    value={data.lastName}
                    onChange={(value) => handleInputChange('lastName', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., Smith"
                    required
                />
                
                <InputField
                    label="University"
                    type="text"
                    value={data.university}
                    onChange={(value) => handleInputChange('university', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., University of British Columbia"
                    required
                    helpText="Enter the full university name"
                />
            </div>
        </div>
    );
};

export default ProfessorSearchForm; 