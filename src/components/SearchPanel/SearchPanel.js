import React, { useState, useCallback } from 'react';
import SearchTypeSelector from './SearchTypeSelector';
import CourseSearchForm from './CourseSearchForm';
import ProfessorSearchForm from './ProfessorSearchForm';
import AdvancedFilters from './AdvancedFilters';
import Button from '../UI/Button';
import './SearchPanel.css';

/**
 * SearchPanel Component - Smart Component
 * Manages search form state and handles search execution
 */
const SearchPanel = ({ 
    searchType, 
    onSearchTypeChange, 
    onSearch, 
    isLoading 
}) => {
    const [courseData, setCourseData] = useState({
        courseName: '',
        courseNumber: ''
    });
    
    const [professorData, setProfessorData] = useState({
        firstName: '',
        lastName: '',
        university: ''
    });
    
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        minRating: '',
        maxDifficulty: ''
    });

    /**
     * Handle search type change and reset form data
     */
    const handleSearchTypeChange = useCallback((newType) => {
        onSearchTypeChange(newType);
        // Reset form data when switching search types
        setCourseData({ courseName: '', courseNumber: '' });
        setProfessorData({ firstName: '', lastName: '', university: '' });
    }, [onSearchTypeChange]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        const searchData = searchType === 'course' ? courseData : professorData;
        onSearch(searchData);
    }, [searchType, courseData, professorData, onSearch]);

    /**
     * Handle Enter key press in form fields
     */
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <div className="search-panel">
            <div className="search-content">
                {/* Search Type Selector */}
                <SearchTypeSelector
                    searchType={searchType}
                    onSearchTypeChange={handleSearchTypeChange}
                />

                {/* Search Forms */}
                <form onSubmit={handleSubmit}>
                    {searchType === 'course' ? (
                        <CourseSearchForm
                            data={courseData}
                            onChange={setCourseData}
                            onKeyPress={handleKeyPress}
                        />
                    ) : (
                        <ProfessorSearchForm
                            data={professorData}
                            onChange={setProfessorData}
                            onKeyPress={handleKeyPress}
                        />
                    )}

                    {/* Search Actions */}
                    <div className="search-actions">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            icon={isLoading ? "fas fa-spinner fa-spin" : "fas fa-search"}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                        
                        <Button
                            type="button"
                            variant="secondary"
                            icon="fas fa-sliders-h"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            Advanced
                        </Button>
                    </div>
                </form>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <AdvancedFilters
                        filters={filters}
                        onChange={setFilters}
                    />
                )}
            </div>
        </div>
    );
};

export default SearchPanel; 