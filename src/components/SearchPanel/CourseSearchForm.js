import React from 'react';
import InputField from '../UI/InputField';
import './CourseSearchForm.css';

/**
 * CourseSearchForm Component - Presentational Component
 * Modern form fields for UBC course search (course name, number only)
 */
const CourseSearchForm = ({ data, onChange, onKeyPress }) => {
    const handleInputChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="search-form course-search-form">
            <div className="form-grid">
                <InputField
                    label="Course Name"
                    type="text"
                    value={data.courseName}
                    onChange={(value) => handleInputChange('courseName', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., CPSC, MATH, PHYS"
                    required
                    className="modern-input"
                />

                <InputField
                    label="Course Number"
                    type="text"
                    value={data.courseNumber}
                    onChange={(value) => handleInputChange('courseNumber', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., 110, 221, 310"
                    required
                    className="modern-input"
                />
            </div>

            <div className="university-badge">
                <i className="fas fa-graduation-cap"></i>
                <span>University of British Columbia</span>
            </div>
        </div>
    );
};

export default CourseSearchForm; 