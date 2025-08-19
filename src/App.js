import React, { useState, useCallback } from 'react';
import Header from './components/Header/Header';
import SearchPanel from './components/SearchPanel/SearchPanel';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import InsightsPanel from './components/InsightsPanel/InsightsPanel';
import { searchByCourse, searchByProfessor } from './services/apiService';
import './styles/App.css';

/**
 * Main App Component - Smart Component
 * Manages the global application state and coordinates between all panels
 */
const App = () => {
    // Global application state
    const [searchType, setSearchType] = useState('course');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchMeta, setSearchMeta] = useState({ term: '', count: 0 });

    /**
     * Handle search execution - Smart component method
     * Determines search type and calls appropriate API service
     */
    const handleSearch = useCallback(async (searchData) => {
        setIsLoading(true);
        setError(null);
        setSearchResults([]);
        setSelectedResult(null);

        try {
            let results;
            if (searchType === 'course') {
                results = await searchByCourse(searchData);
                setSearchMeta({
                    term: `${searchData.courseName} ${searchData.courseNumber}`,
                    count: results.length
                });
            } else {
                results = await searchByProfessor(searchData);
                setSearchMeta({
                    term: `${searchData.firstName} ${searchData.lastName}`,
                    count: results.length
                });
            }
            
            setSearchResults(results);
            
            // Auto-select first result if available
            if (results.length > 0) {
                setSelectedResult(results[0]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [searchType]);

    /**
     * Handle result selection - Updates insights panel
     */
    const handleResultSelect = useCallback((result) => {
        setSelectedResult(result);
    }, []);

    /**
     * Handle search type change - Resets state
     */
    const handleSearchTypeChange = useCallback((newType) => {
        setSearchType(newType);
        setSearchResults([]);
        setSelectedResult(null);
        setError(null);
        setSearchMeta({ term: '', count: 0 });
    }, []);

    /**
     * Handle sort change - Re-orders results
     */
    const handleSort = useCallback((sortBy) => {
        const sortedResults = [...searchResults].sort((a, b) => {
            const aData = a.details || a;
            const bData = b.details || b;
            
            switch (sortBy) {
                case 'rating':
                    const aRating = parseFloat(aData.overall_quality) || 0;
                    const bRating = parseFloat(bData.overall_quality) || 0;
                    return bRating - aRating;
                    
                case 'difficulty':
                    const aDiff = parseFloat(aData.difficulty) || 0;
                    const bDiff = parseFloat(bData.difficulty) || 0;
                    return aDiff - bDiff;
                    
                case 'reviews':
                    const aReviews = (aData.ratings && aData.ratings.length) || a.num_ratings || 0;
                    const bReviews = (bData.ratings && bData.ratings.length) || b.num_ratings || 0;
                    return bReviews - aReviews;
                    
                default:
                    return 0;
            }
        });
        
        setSearchResults(sortedResults);
    }, [searchResults]);

    return (
        <div className="app">
            <Header />
            
            <main className="main-container">
                {/* Search Panel */}
                <SearchPanel
                    searchType={searchType}
                    onSearchTypeChange={handleSearchTypeChange}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />

                {/* Content Area with Results and Insights */}
                <div className="content-area">
                    <ResultsPanel
                        searchType={searchType}
                        results={searchResults}
                        selectedResult={selectedResult}
                        searchMeta={searchMeta}
                        isLoading={isLoading}
                        error={error}
                        onResultSelect={handleResultSelect}
                        onSort={handleSort}
                    />

                    <InsightsPanel
                        selectedResult={selectedResult}
                        searchType={searchType}
                    />
                </div>
            </main>
        </div>
    );
};

export default App; 