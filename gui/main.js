// Prof Pilot - Main JavaScript Application
class ProfPilot {
    constructor() {
        this.currentSearchType = 'course';
        this.currentResults = [];
        this.selectedResult = null;
        this.apiBaseUrl = 'http://localhost:3000';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        // Search type toggle
        $('input[name="search-type"]').on('change', (e) => {
            this.currentSearchType = e.target.value;
            this.toggleSearchForm();
        });

        // Advanced search toggle
        $('#advanced-toggle').on('click', () => {
            $('#advanced-search').toggleClass('hidden');
        });

        // Search button
        $('#search-btn').on('click', () => {
            this.performSearch();
        });

        // Enter key search
        $('.search-input').on('keypress', (e) => {
            if (e.which === 13) {
                this.performSearch();
            }
        });

        // Sort functionality
        $('#sort-by').on('change', () => {
            this.sortResults();
        });

        // Insights panel toggle (mobile)
        $('#insights-toggle').on('click', () => {
            $('#insights-panel').toggleClass('collapsed');
        });

        // Result card click handling
        $(document).on('click', '.result-card', (e) => {
            const cardElement = $(e.currentTarget);
            const index = cardElement.data('index');
            this.selectResult(index);
        });
    }

    setupUI() {
        this.toggleSearchForm();
    }

    toggleSearchForm() {
        if (this.currentSearchType === 'course') {
            $('#course-search-form').removeClass('hidden');
            $('#professor-search-form').addClass('hidden');
        } else {
            $('#course-search-form').addClass('hidden');
            $('#professor-search-form').removeClass('hidden');
        }
        
        // Clear previous results when switching
        this.clearResults();
    }

    async performSearch() {
        try {
            this.showLoading();
            this.clearResults();

            let searchData;
            if (this.currentSearchType === 'course') {
                searchData = await this.searchByCourse();
            } else {
                searchData = await this.searchByProfessor();
            }

            this.hideLoading();
            this.displayResults(searchData);
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    async searchByCourse() {
        const courseName = $('#course-name').val().trim();
        const courseNumber = $('#course-number').val().trim();
        const universityNumber = $('#university-number').val().trim();

        if (!courseName || !courseNumber || !universityNumber) {
            throw new Error('Please fill in all course search fields');
        }

        const response = await $.ajax({
            url: `${this.apiBaseUrl}/course`,
            method: 'GET',
            data: {
                course_name: courseName,
                department_number: courseNumber,
                university_number: universityNumber
            }
        });

        // Fetch detailed data for each professor
        const professorsWithDetails = await Promise.all(
            response.professors.map(async (prof) => {
                try {
                    const detailResponse = await $.ajax({
                        url: `${this.apiBaseUrl}/professor`,
                        method: 'GET',
                        data: {
                            fname: prof.first_name,
                            lname: prof.last_name,
                            university: prof.university
                        }
                    });
                    
                    return {
                        ...prof,
                        details: detailResponse
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${prof.name}:`, error);
                    return {
                        ...prof,
                        details: null
                    };
                }
            })
        );

        return {
            type: 'course',
            searchTerm: `${courseName} ${courseNumber}`,
            results: professorsWithDetails
        };
    }

    async searchByProfessor() {
        const firstName = $('#prof-first-name').val().trim();
        const lastName = $('#prof-last-name').val().trim();
        const university = $('#prof-university').val().trim();

        if (!firstName || !lastName || !university) {
            throw new Error('Please fill in all professor search fields');
        }

        const response = await $.ajax({
            url: `${this.apiBaseUrl}/professor`,
            method: 'GET',
            data: {
                fname: firstName,
                lname: lastName,
                university: university
            }
        });

        return {
            type: 'professor',
            searchTerm: `${firstName} ${lastName}`,
            results: [response]
        };
    }

    displayResults(searchData) {
        this.currentResults = searchData.results;
        
        // Update results header
        const resultCount = this.currentResults.length;
        $('#results-title').text(
            searchData.type === 'course' 
                ? `Professors teaching ${searchData.searchTerm}`
                : `Results for ${searchData.searchTerm}`
        );
        $('#results-meta').text(`${resultCount} result${resultCount !== 1 ? 's' : ''} found`);

        // Show sort controls if we have results
        if (resultCount > 0) {
            $('#sort-controls').removeClass('hidden');
        }

        // Clear and populate results
        const resultsContainer = $('#results-content');
        resultsContainer.empty();

        if (resultCount === 0) {
            resultsContainer.html(`
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Results Found</h3>
                    <p>Try adjusting your search criteria or check for typos.</p>
                </div>
            `);
            return;
        }

        // Display result cards
        this.currentResults.forEach((result, index) => {
            const card = this.createResultCard(result, index, searchData.type);
            resultsContainer.append(card);
        });

        // Auto-select first result
        if (this.currentResults.length > 0) {
            this.selectResult(0);
        }
    }

    createResultCard(result, index, searchType) {
        if (searchType === 'course') {
            return this.createProfessorCard(result, index);
        } else {
            return this.createProfessorDetailCard(result, index);
        }
    }

    createProfessorCard(professor, index) {
        const details = professor.details;
        const hasDetails = details && !details.error;
        
        const rating = hasDetails ? parseFloat(details.overall_quality) || 0 : 0;
        const difficulty = hasDetails ? parseFloat(details.difficulty) || 0 : 0;
        const wouldTakeAgain = hasDetails ? details.would_take_again || 'N/A' : 'N/A';
        const numRatings = professor.num_ratings || 0;

        const ratingClass = rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low';

        // Extract common tags from ratings
        const tags = hasDetails && details.ratings ? 
            this.extractCommonTags(details.ratings) : [];

        return $(`
            <div class="result-card fade-in" data-index="${index}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${professor.name}</div>
                        <div class="card-subtitle">${professor.department}</div>
                    </div>
                    <div class="rating-badge ${ratingClass}">
                        ${rating > 0 ? rating.toFixed(1) : 'N/A'}
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <div class="stat-value">${difficulty > 0 ? difficulty.toFixed(1) : 'N/A'}</div>
                        <div class="stat-label">Difficulty</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${wouldTakeAgain}</div>
                        <div class="stat-label">Would Take Again</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${numRatings}</div>
                        <div class="stat-label">Reviews</div>
                    </div>
                </div>
                ${tags.length > 0 ? `
                    <div class="card-tags">
                        ${tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `);
    }

    createProfessorDetailCard(professor, index) {
        const rating = parseFloat(professor.overall_quality) || 0;
        const difficulty = parseFloat(professor.difficulty) || 0;
        const wouldTakeAgain = professor.would_take_again || 'N/A';
        const numRatings = professor.ratings ? professor.ratings.length : 0;

        const ratingClass = rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low';

        // Extract common tags from ratings
        const tags = professor.ratings ? this.extractCommonTags(professor.ratings) : [];

        return $(`
            <div class="result-card fade-in" data-index="${index}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${professor.first_name} ${professor.last_name}</div>
                        <div class="card-subtitle">${professor.university}</div>
                    </div>
                    <div class="rating-badge ${ratingClass}">
                        ${rating > 0 ? rating.toFixed(1) : 'N/A'}
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <div class="stat-value">${difficulty > 0 ? difficulty.toFixed(1) : 'N/A'}</div>
                        <div class="stat-label">Difficulty</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${wouldTakeAgain}</div>
                        <div class="stat-label">Would Take Again</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${numRatings}</div>
                        <div class="stat-label">Reviews</div>
                    </div>
                </div>
                ${tags.length > 0 ? `
                    <div class="card-tags">
                        ${tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `);
    }

    selectResult(index) {
        this.selectedResult = this.currentResults[index];
        
        // Update UI
        $('.result-card').removeClass('selected');
        $(`.result-card[data-index="${index}"]`).addClass('selected');

        // Update insights panel
        this.displayInsights(this.selectedResult);
    }

    displayInsights(result) {
        const insightsContent = $('#insights-content');
        
        // Determine if this is a course search result or professor search result
        const details = result.details || result;
        const hasValidData = details && !details.error && details.ratings && details.summary;

        if (!hasValidData) {
            insightsContent.html(`
                <div class="empty-insights">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No detailed insights available for this selection.</p>
                </div>
            `);
            return;
        }

        // Generate insights
        const insights = this.generateInsights(details);
        
        insightsContent.html(`
            <div class="insights-section">
                <h4><i class="fas fa-robot"></i> AI Summary</h4>
                <div class="ai-summary">
                    ${details.summary || 'No summary available.'}
                </div>
            </div>
            
            <div class="insights-section">
                <h4><i class="fas fa-tags"></i> Tag Analytics</h4>
                <div class="tag-analytics">
                    ${this.renderTagAnalytics(insights.tagData)}
                </div>
            </div>
            
            <div class="insights-section">
                <h4><i class="fas fa-chart-line"></i> Quick Stats</h4>
                <div class="quick-stats">
                    ${this.renderQuickStats(insights.stats)}
                </div>
            </div>
        `);
    }

    generateInsights(professorData) {
        const ratings = professorData.ratings || [];
        
        // Calculate tag frequencies
        const tagCount = {};
        const totalRatings = ratings.length;
        
        ratings.forEach(rating => {
            if (rating.tags) {
                rating.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        // Convert to percentage and sort
        const tagData = Object.entries(tagCount)
            .map(([tag, count]) => ({
                name: tag,
                count: count,
                percentage: Math.round((count / totalRatings) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 8); // Top 8 tags

        // Calculate stats
        const stats = {
            totalReviews: totalRatings,
            avgRating: parseFloat(professorData.overall_quality) || 0,
            avgDifficulty: parseFloat(professorData.difficulty) || 0,
            wouldTakeAgainPercentage: professorData.would_take_again || 'N/A',
            coursesWithA: ratings.filter(r => r.gradeReceived && r.gradeReceived.startsWith('A')).length,
            coursesWithB: ratings.filter(r => r.gradeReceived && r.gradeReceived.startsWith('B')).length
        };

        return { tagData, stats };
    }

    renderTagAnalytics(tagData) {
        if (!tagData || tagData.length === 0) {
            return '<p>No tag data available.</p>';
        }

        return tagData.map(tag => `
            <div class="tag-item">
                <div class="tag-bar">
                    <span class="tag-name">${tag.name}</span>
                    <span class="tag-percentage">${tag.percentage}%</span>
                </div>
                <div class="tag-progress">
                    <div class="tag-progress-bar" style="width: ${tag.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    renderQuickStats(stats) {
        return `
            <div class="quick-stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalReviews}</div>
                    <div class="stat-desc">Total Reviews</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.avgRating.toFixed(1)}</div>
                    <div class="stat-desc">Avg Rating</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.avgDifficulty.toFixed(1)}</div>
                    <div class="stat-desc">Avg Difficulty</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.coursesWithA + stats.coursesWithB}</div>
                    <div class="stat-desc">A/B Grades</div>
                </div>
            </div>
        `;
    }

    extractCommonTags(ratings) {
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
    }

    sortResults() {
        const sortBy = $('#sort-by').val();
        
        this.currentResults.sort((a, b) => {
            const aDetails = a.details || a;
            const bDetails = b.details || b;
            
            switch (sortBy) {
                case 'rating':
                    const aRating = parseFloat(aDetails.overall_quality) || 0;
                    const bRating = parseFloat(bDetails.overall_quality) || 0;
                    return bRating - aRating;
                    
                case 'difficulty':
                    const aDiff = parseFloat(aDetails.difficulty) || 0;
                    const bDiff = parseFloat(bDetails.difficulty) || 0;
                    return aDiff - bDiff;
                    
                case 'reviews':
                    const aReviews = (aDetails.ratings && aDetails.ratings.length) || a.num_ratings || 0;
                    const bReviews = (bDetails.ratings && bDetails.ratings.length) || b.num_ratings || 0;
                    return bReviews - aReviews;
                    
                default:
                    return 0;
            }
        });

        // Re-render results
        this.displayResults({
            type: this.currentSearchType,
            searchTerm: $('#results-title').text().replace(/^(Professors teaching |Results for )/, ''),
            results: this.currentResults
        });
    }

    showLoading() {
        $('#results-content').addClass('hidden');
        $('#loading-state').removeClass('hidden');
        $('#search-btn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Searching...');
    }

    hideLoading() {
        $('#results-content').removeClass('hidden');
        $('#loading-state').addClass('hidden');
        $('#search-btn').prop('disabled', false).html('<i class="fas fa-search"></i> Search');
    }

    clearResults() {
        this.currentResults = [];
        this.selectedResult = null;
        $('#results-content').empty();
        $('#insights-content').html(`
            <div class="empty-insights">
                <i class="fas fa-lightbulb"></i>
                <p>Select a professor or course to see AI-powered insights and analytics.</p>
            </div>
        `);
        $('#sort-controls').addClass('hidden');
    }

    showError(message) {
        $('#results-content').html(`
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <h3>Search Error</h3>
                <p>${message}</p>
            </div>
        `);
    }
}

// Add custom CSS for additional components
const additionalCSS = `
<style>
.quick-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.stat-card {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #f0f0f0;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.25rem;
}

.stat-desc {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tag-item {
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .insights-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        border-radius: 20px 20px 0 0;
        max-height: 50vh;
        transform: translateY(calc(100% - 80px));
        transition: transform 0.3s ease;
    }
    
    .insights-panel:not(.collapsed) {
        transform: translateY(0);
    }
    
    .insights-toggle {
        display: block !important;
    }
}
</style>
`;

// Initialize the application when document is ready
$(document).ready(() => {
    // Add additional CSS
    $('head').append(additionalCSS);
    
    // Initialize Prof Pilot app
    window.profPilot = new ProfPilot();
    
    console.log('Prof Pilot initialized successfully!');
});