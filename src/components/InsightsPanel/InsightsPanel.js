import React from 'react';
import './InsightsPanel.css';

/**
 * InsightsPanel Component - Smart Component
 * Displays AI summaries and analytics for selected professor
 */
const InsightsPanel = ({ selectedResult, searchType }) => {
    if (!selectedResult) {
        return (
            <div className="insights-panel">
                <div className="insights-header">
                    <h3>Insights</h3>
                    <button className="insights-toggle">
                        <i className="fas fa-chart-bar"></i>
                    </button>
                </div>
                <div className="insights-content">
                    <div className="empty-insights">
                        <i className="fas fa-lightbulb"></i>
                        <p>Select a professor or course to see AI-powered insights and analytics.</p>
                    </div>
                </div>
            </div>
        );
    }

    const details = selectedResult.details || selectedResult;
    const hasValidData = details && !details.error && details.ratings && details.summary;

    if (!hasValidData) {
        return (
            <div className="insights-panel">
                <div className="insights-header">
                    <h3>Insights</h3>
                </div>
                <div className="insights-content">
                    <div className="empty-insights">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>No detailed insights available for this selection.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Generate tag analytics
    const generateTagAnalytics = (ratings) => {
        const tagCount = {};
        const totalRatings = ratings.length;
        
        ratings.forEach(rating => {
            if (rating.tags) {
                rating.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCount)
            .map(([tag, count]) => ({
                name: tag,
                count: count,
                percentage: Math.round((count / totalRatings) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 8);
    };

    const tagData = generateTagAnalytics(details.ratings || []);

    // Generate quick stats
    const stats = {
        totalReviews: details.ratings?.length || 0,
        avgRating: parseFloat(details.overall_quality) || 0,
        avgDifficulty: parseFloat(details.difficulty) || 0,
        coursesWithA: details.ratings?.filter(r => r.gradeReceived && r.gradeReceived.startsWith('A')).length || 0,
        coursesWithB: details.ratings?.filter(r => r.gradeReceived && r.gradeReceived.startsWith('B')).length || 0
    };

    return (
        <div className="insights-panel">
            <div className="insights-header">
                <h3>Insights</h3>
                <button className="insights-toggle">
                    <i className="fas fa-chart-bar"></i>
                </button>
            </div>

            <div className="insights-content">
                {/* AI Summary */}
                <div className="insights-section">
                    <h4><i className="fas fa-robot"></i> AI Summary</h4>
                    <div className="ai-summary">
                        {details.summary || 'No summary available.'}
                    </div>
                </div>

                {/* Tag Analytics */}
                {tagData.length > 0 && (
                    <div className="insights-section">
                        <h4><i className="fas fa-tags"></i> Tag Analytics</h4>
                        <div className="tag-analytics">
                            {tagData.map(tag => (
                                <div key={tag.name} className="tag-item">
                                    <div className="tag-bar">
                                        <span className="tag-name">{tag.name}</span>
                                        <span className="tag-percentage">{tag.percentage}%</span>
                                    </div>
                                    <div className="tag-progress">
                                        <div 
                                            className="tag-progress-bar" 
                                            style={{ width: `${tag.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="insights-section">
                    <h4><i className="fas fa-chart-line"></i> Quick Stats</h4>
                    <div className="quick-stats">
                        <div className="quick-stats-grid">
                            <div className="stat-card">
                                <div className="stat-number">{stats.totalReviews}</div>
                                <div className="stat-desc">Total Reviews</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{stats.avgRating.toFixed(1)}</div>
                                <div className="stat-desc">Avg Rating</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{stats.avgDifficulty.toFixed(1)}</div>
                                <div className="stat-desc">Avg Difficulty</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{stats.coursesWithA + stats.coursesWithB}</div>
                                <div className="stat-desc">A/B Grades</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsPanel; 