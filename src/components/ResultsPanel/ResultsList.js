import React from 'react';

/**
 * Modern ResultsList Component - Presentational Component
 * Displays search results in beautiful, responsive card layout
 */
const ResultsList = ({ results, selectedResult, searchType, onResultSelect }) => {

    const createModernCard = (result, index) => {
        const details = result.details || result;
        const hasDetails = details && !details.error;

        const rating = hasDetails ? parseFloat(details.overall_quality) || 0 : 0;
        const difficulty = hasDetails ? parseFloat(details.difficulty) || 0 : 0;
        const wouldTakeAgain = hasDetails ? details.would_take_again || 'N/A' : 'N/A';
        const numRatings = result.numRatings || (details.ratings ? details.ratings.length : 0);

        // Extract common tags
        const tags = hasDetails && details.ratings ?
            extractCommonTags(details.ratings) : [];

        // Use the properly parsed name fields
        const name = result.name || `${result.firstName || ''} ${result.lastName || ''}`.trim();
        const subtitle = result.department || result.university || '';
        const type = searchType === 'course' ? 'Professor' : 'Course';

        const isSelected = selectedResult === result;

        return (
            <div
                key={index}
                className={`modern-card ${isSelected ? 'ring-2 ring-blue-400 ring-opacity-60' : ''} fade-in`}
                onClick={() => onResultSelect(result)}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className="card-content">
                    {/* Header Section - Clean and Organized */}
                    <div className="card-header">
                        <div className="professor-info">
                            <div className="professor-name-section">
                                <h3 className="professor-name">{name}</h3>
                                <p className="professor-title">{subtitle}</p>
                            </div>
                            <div className="professor-type-badge">
                                <span className="type-badge">{type}</span>
                            </div>
                        </div>

                        {/* Overall Rating - Prominently Displayed */}
                        {rating > 0 && (
                            <div className="overall-rating">
                                <div className={`rating-number ${
                                    rating >= 4 ? 'excellent' :
                                    rating >= 3 ? 'good' : 'poor'
                                }`}>
                                    {rating.toFixed(1)}
                                </div>
                                <div className="rating-label">Overall Rating</div>
                            </div>
                        )}
                    </div>

                    {/* Statistics Section - Well Organized Grid */}
                    <div className="statistics-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-brain"></i>
                                </div>
                                <div className="stat-content">
                                    <div className={`stat-number ${difficulty > 0 ? (
                                        difficulty <= 2 ? 'easy' :
                                        difficulty <= 3.5 ? 'moderate' : 'hard'
                                    ) : 'neutral'}`}>
                                        {difficulty > 0 ? difficulty.toFixed(1) : 'N/A'}
                                    </div>
                                    <div className="stat-label">Difficulty Level</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-thumbs-up"></i>
                                </div>
                                <div className="stat-content">
                                    <div className={`stat-number ${
                                        wouldTakeAgain === 'Yes' || wouldTakeAgain === 'yes' ? 'positive' :
                                        wouldTakeAgain === 'No' || wouldTakeAgain === 'no' ? 'negative' :
                                        'neutral'
                                    }`}>
                                        {wouldTakeAgain}
                                    </div>
                                    <div className="stat-label">Would Take Again</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number reviews">{numRatings}</div>
                                    <div className="stat-label">Student Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section - Modern Pill Design */}
                    {tags.length > 0 && (
                        <div className="tags-section">
                            <div className="tags-label">Common Tags:</div>
                            <div className="tags-container">
                                {tags.slice(0, 4).map((tag, tagIndex) => (
                                    <span key={tagIndex} className="tag-pill">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Section - Clean and Accessible */}
                    <div className="action-section">
                        <button className="action-btn primary">
                            <i className="fas fa-eye"></i>
                            <span>View Details</span>
                        </button>
                        {rating > 0 && (
                            <div className="rating-display">
                                <i className="fas fa-star"></i>
                                <span>{rating.toFixed(1)} / 5.0</span>
                            </div>
                        )}
                    </div>
                </div>
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
        <div className="results-grid">
            {results.map((result, index) => createModernCard(result, index))}
        </div>
    );
};

export default ResultsList; 