import React from 'react';
import ResultsHeader from './ResultsHeader';
import ResultsList from './ResultsList';
import LoadingState from '../UI/LoadingState';
import EmptyState from '../UI/EmptyState';
import ErrorState from '../UI/ErrorState';
import './ResultsPanel.css';

/**
 * ResultsPanel Component - Smart Component
 * Manages the display of search results, loading states, and errors
 */
const ResultsPanel = ({
    searchType,
    results,
    selectedResult,
    searchMeta,
    isLoading,
    error,
    onResultSelect,
    onSort
}) => {
    /**
     * Render appropriate content based on current state
     */
    const renderContent = () => {
        if (isLoading) {
            return <LoadingState message="Searching and analyzing data..." />;
        }

        if (error) {
            return <ErrorState message={error} />;
        }

        if (results.length === 0 && searchMeta.term) {
            return (
                <EmptyState
                    icon="fas fa-search"
                    title="No Results Found"
                    message="Try adjusting your search criteria or check for typos."
                />
            );
        }

        if (results.length === 0) {
            return (
                <EmptyState
                    icon="fas fa-search"
                    title="Start Your Search"
                    message="Choose to search by course or professor above to find detailed ratings and insights."
                />
            );
        }

        return (
            <ResultsList
                results={results}
                selectedResult={selectedResult}
                searchType={searchType}
                onResultSelect={onResultSelect}
            />
        );
    };

    /**
     * Determine results title based on search type and meta data
     */
    const getResultsTitle = () => {
        if (!searchMeta.term) {
            return 'Ready to Search';
        }

        return searchType === 'course'
            ? `Professors teaching ${searchMeta.term}`
            : `Results for ${searchMeta.term}`;
    };

    return (
        <div className="results-panel">
            <ResultsHeader
                title={getResultsTitle()}
                meta={searchMeta}
                showSortControls={results.length > 0 && !isLoading}
                onSort={onSort}
            />

            <div className="results-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default ResultsPanel; 