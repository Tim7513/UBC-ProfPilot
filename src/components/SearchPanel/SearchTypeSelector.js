import React from 'react';
import './SearchTypeSelector.css';

/**
 * SearchTypeSelector Component - Presentational Component
 * Radio button group for selecting search type (course vs professor)
 */
const SearchTypeSelector = ({ searchType, onSearchTypeChange }) => {
    return (
        <div className="search-type-selector">
            <div className="radio-group">
                <input
                    type="radio"
                    id="search-course"
                    name="search-type"
                    value="course"
                    checked={searchType === 'course'}
                    onChange={(e) => onSearchTypeChange(e.target.value)}
                />
                <label htmlFor="search-course">
                    <i className="fas fa-book"></i>
                    Search by Course
                </label>
                
                <input
                    type="radio"
                    id="search-professor"
                    name="search-type"
                    value="professor"
                    checked={searchType === 'professor'}
                    onChange={(e) => onSearchTypeChange(e.target.value)}
                />
                <label htmlFor="search-professor">
                    <i className="fas fa-user-tie"></i>
                    Search by Professor
                </label>
            </div>
        </div>
    );
};

export default SearchTypeSelector; 