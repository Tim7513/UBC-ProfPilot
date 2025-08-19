import React from 'react';

/**
 * ResultsHeader Component - Presentational Component
 * Header for results panel with title, meta info, and sort controls
 */
const ResultsHeader = ({ title, meta, showSortControls, onSort }) => {
    return (
        <div className="results-header">
            <div className="results-info">
                <h2>{title}</h2>
                {meta.count > 0 && (
                    <div className="results-meta">
                        {meta.count} result{meta.count !== 1 ? 's' : ''} found
                    </div>
                )}
            </div>
            
            {showSortControls && (
                <div className="sort-controls">
                    <label htmlFor="sort-by">Sort by:</label>
                    <select id="sort-by" onChange={(e) => onSort(e.target.value)}>
                        <option value="rating">Rating</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="reviews">Number of Reviews</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default ResultsHeader; 