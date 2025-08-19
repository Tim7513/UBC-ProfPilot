import React from 'react';

/**
 * ResultsList Component - Presentational Component
 * Displays list of search results as clickable cards
 */
const ResultsList = ({ results, selectedResult, searchType, onResultSelect }) => {
    
    const createResultCard = (result, index) => {
        const details = result.details || result;
        const hasDetails = details && !details.error;
        
        const rating = hasDetails ? parseFloat(details.overall_quality) || 0 : 0;
        const difficulty = hasDetails ? parseFloat(details.difficulty) || 0 : 0;
        const wouldTakeAgain = hasDetails ? details.would_take_again || 'N/A' : 'N/A';
        const numRatings = result.num_ratings || (details.ratings ? details.ratings.length : 0);

        const ratingClass = rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low';
        const isSelected = selectedResult === result;

        // Extract common tags
        const tags = hasDetails && details.ratings ? 
            extractCommonTags(details.ratings) : [];

        const name = searchType === 'course' ? result.name : `${result.first_name} ${result.last_name}`;
        const subtitle = searchType === 'course' ? result.department : result.university;

        return (
            <div 
                key={index}
                className={`result-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onResultSelect(result)}
            >
                <div className="card-header">
                    <div>
                        <div className="card-title">{name}</div>
                        <div className="card-subtitle">{subtitle}</div>
                    </div>
                    <div className={`rating-badge ${ratingClass}`}>
                        {rating > 0 ? rating.toFixed(1) : 'N/A'}
                    </div>
                </div>
                
                <div className="card-stats">
                    <div className="stat-item">
                        <div className="stat-value">{difficulty > 0 ? difficulty.toFixed(1) : 'N/A'}</div>
                        <div className="stat-label">Difficulty</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{wouldTakeAgain}</div>
                        <div className="stat-label">Would Take Again</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{numRatings}</div>
                        <div className="stat-label">Reviews</div>
                    </div>
                </div>
                
                {tags.length > 0 && (
                    <div className="card-tags">
                        {tags.slice(0, 4).map((tag, tagIndex) => (
                            <span key={tagIndex} className="tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const extractCommonTags = (ratings) => {
        const tagCount = {};
        ratings.forEach(rating => {
            if (rating.tags) {
                rating.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([tag]) => tag);
    };

    return (
        <div className="results-list">
            {results.map((result, index) => createResultCard(result, index))}
        </div>
    );
};

export default ResultsList; 