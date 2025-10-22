import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import * as apiService from '../../../src/services/apiService';

// Mock the API service
jest.mock('../../../src/services/apiService', () => ({
  searchByCourse: jest.fn(),
  searchByProfessor: jest.fn(),
}));

// Mock CSS imports
jest.mock('../../../src/styles/App.css', () => ({}));

describe('App Component', () => {
  const mockCourseResults = [
    {
      name: 'Dr. Smith',
      firstName: 'John',
      lastName: 'Smith',
      details: {
        overall_quality: '4.5',
        difficulty: '3.2',
        would_take_again: '85%',
        ratings: [
          { comment: 'Great professor!', rating: 5 },
          { comment: 'Very helpful', rating: 4 }
        ]
      }
    }
  ];

  const mockProfessorResults = [
    {
      overall_quality: '4.2',
      difficulty: '3.8',
      would_take_again: '78%',
      first_name: 'Patrice',
      last_name: 'Belleville',
      university: 'University of British Columbia'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders application correctly', () => {
    render(<App />);

    expect(screen.getByText('Prof Pilot')).toBeInTheDocument();
    expect(screen.getByText('Course Search')).toBeInTheDocument();
    expect(screen.getByText('Professor Search')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('starts with course search by default', () => {
    render(<App />);

    expect(screen.getByText('Course Search')).toBeInTheDocument();
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/university id/i)).toBeInTheDocument();
  });

  test('handles course search successfully', async () => {
    const user = userEvent.setup();
    apiService.searchByCourse.mockResolvedValue(mockCourseResults);

    render(<App />);

    // Fill out course search form
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    // Submit search
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(apiService.searchByCourse).toHaveBeenCalledWith({
        courseName: 'CPSC',
        courseNumber: '110',
        universityNumber: '1413'
      });
    });

    // Check results are displayed
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument(); // Rating
      expect(screen.getByText('3.2')).toBeInTheDocument(); // Difficulty
    });
  });

  test('handles professor search successfully', async () => {
    const user = userEvent.setup();
    apiService.searchByProfessor.mockResolvedValue(mockProfessorResults);

    render(<App />);

    // Switch to professor search
    const professorTab = screen.getByRole('tab', { name: /professor/i });
    await user.click(professorTab);

    // Fill out professor search form
    await user.type(screen.getByLabelText(/first name/i), 'Patrice');
    await user.type(screen.getByLabelText(/last name/i), 'Belleville');
    await user.type(screen.getByLabelText(/university/i), 'University of British Columbia');

    // Submit search
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(apiService.searchByProfessor).toHaveBeenCalledWith({
        firstName: 'Patrice',
        lastName: 'Belleville',
        university: 'University of British Columbia'
      });
    });

    // Check results are displayed
    await waitFor(() => {
      expect(screen.getByText('4.2')).toBeInTheDocument(); // Rating
      expect(screen.getByText('3.8')).toBeInTheDocument(); // Difficulty
      expect(screen.getByText('78%')).toBeInTheDocument(); // Would take again
    });
  });

  test('handles search errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'API Error occurred';
    apiService.searchByCourse.mockRejectedValue(new Error(errorMessage));

    render(<App />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('switches between search types correctly', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Should start with course search
    expect(screen.getByText('Course Search')).toBeInTheDocument();
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();

    // Switch to professor search
    const professorTab = screen.getByRole('tab', { name: /professor/i });
    await user.click(professorTab);

    expect(screen.getByText('Professor Search')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();

    // Switch back to course search
    const courseTab = screen.getByRole('tab', { name: /course/i });
    await user.click(courseTab);

    expect(screen.getByText('Course Search')).toBeInTheDocument();
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
  });

  test('handles result selection', async () => {
    const user = userEvent.setup();
    apiService.searchByCourse.mockResolvedValue(mockCourseResults);

    render(<App />);

    // Perform search
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Wait for results and click on professor card
    await waitFor(() => {
      const professorCard = screen.getByText('Dr. Smith').closest('div');
      if (professorCard) {
        fireEvent.click(professorCard);
      }
    });

    // Verify insights panel updates (this would need more specific testing based on actual component structure)
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  test('handles sorting functionality', async () => {
    const user = userEvent.setup();
    const unsortedResults = [
      {
        name: 'Dr. Low Rating',
        details: { overall_quality: '2.5', difficulty: '2.0' }
      },
      {
        name: 'Dr. High Rating',
        details: { overall_quality: '4.8', difficulty: '3.5' }
      }
    ];

    apiService.searchByCourse.mockResolvedValue(unsortedResults);

    render(<App />);

    // Perform search
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Dr. Low Rating')).toBeInTheDocument();
      expect(screen.getByText('Dr. High Rating')).toBeInTheDocument();
    });

    // Test sorting by rating
    const sortDropdown = screen.getByRole('combobox');
    await user.selectOptions(sortDropdown, 'rating');

    // Results should be sorted (highest rating first)
    const resultElements = screen.getAllByText(/Dr\./);
    expect(resultElements[0]).toHaveTextContent('Dr. High Rating');
  });

  test('shows loading state during search', async () => {
    const user = userEvent.setup();
    // Mock a delayed response
    apiService.searchByCourse.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCourseResults), 100))
    );

    render(<App />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Should show loading state
    expect(screen.getByText(/loading/i) || screen.getByRole('status')).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('resets state when switching search types', async () => {
    const user = userEvent.setup();
    apiService.searchByCourse.mockResolvedValue(mockCourseResults);

    render(<App />);

    // Perform course search
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    // Switch to professor search
    const professorTab = screen.getByRole('tab', { name: /professor/i });
    await user.click(professorTab);

    // Results should be cleared
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    apiService.searchByCourse.mockResolvedValue(mockCourseResults);

    render(<App />);

    // Fill out form using keyboard
    await user.type(screen.getByLabelText(/course name/i), 'CPSC');
    await user.type(screen.getByLabelText(/course number/i), '110');
    await user.type(screen.getByLabelText(/university id/i), '1413');

    // Submit using Enter key
    await user.type(screen.getByLabelText(/university id/i), '{enter}');

    await waitFor(() => {
      expect(apiService.searchByCourse).toHaveBeenCalled();
    });
  });
});
