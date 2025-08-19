import React from 'react';
import InputField from '../UI/InputField';
import './CourseSearchForm.css';

/**
 * CourseSearchForm Component - Presentational Component
 * Form fields for course search (course name, number, university ID)
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
            <div className="input-group">
                <InputField
                    label="Course Name"
                    type="text"
                    value={data.courseName}
                    onChange={(value) => handleInputChange('courseName', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., CPSC"
                    required
                />
                
                <InputField
                    label="Course Number"
                    type="text"
                    value={data.courseNumber}
                    onChange={(value) => handleInputChange('courseNumber', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., 110"
                    required
                />
                
                <InputField
                    label="University ID"
                    type="text"
                    value={data.universityNumber}
                    onChange={(value) => handleInputChange('universityNumber', value)}
                    onKeyPress={onKeyPress}
                    placeholder="e.g., 1413"
                    required
                    helpText="UBC's ID on RateMyProfessors is 1413"
                />
            </div>
        </div>
    );
};

export default CourseSearchForm; 