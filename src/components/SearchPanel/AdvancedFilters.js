import React from 'react';

/**
 * AdvancedFilters Component - Presentational Component
 * Advanced search filters for rating and difficulty
 */
const AdvancedFilters = ({ filters, onChange }) => {
    const handleFilterChange = (field, value) => {
        onChange({
            ...filters,
            [field]: value
        });
    };

    return (
        <div className="advanced-search">
            <div className="advanced-content">
                <h4>Advanced Filters</h4>
                <div className="filter-group">
                    <div className="filter-item">
                        <label htmlFor="min-rating">Min Rating</label>
                        <select 
                            id="min-rating"
                            value={filters.minRating}
                            onChange={(e) => handleFilterChange('minRating', e.target.value)}
                        >
                            <option value="">Any</option>
                            <option value="1">1.0+</option>
                            <option value="2">2.0+</option>
                            <option value="3">3.0+</option>
                            <option value="4">4.0+</option>
                        </select>
                    </div>
                    
                    <div className="filter-item">
                        <label htmlFor="max-difficulty">Max Difficulty</label>
                        <select 
                            id="max-difficulty"
                            value={filters.maxDifficulty}
                            onChange={(e) => handleFilterChange('maxDifficulty', e.target.value)}
                        >
                            <option value="">Any</option>
                            <option value="2">Easy (≤2)</option>
                            <option value="3">Moderate (≤3)</option>
                            <option value="4">Hard (≤4)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilters; 