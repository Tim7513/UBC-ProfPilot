/**
 * API Service Layer
 * Handles all communication with the Prof Pilot backend
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Use relative URLs in production
    : 'http://localhost:3000';

/**
 * Generic API request handler with error handling
 */
const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw new Error(error.message || 'Network request failed');
    }
};

/**
 * Search for professors by UBC course
 * @param {Object} searchData - Course search parameters
 * @param {string} searchData.courseName - Course department (e.g., "CPSC")
 * @param {string} searchData.courseNumber - Course number (e.g., "110")
 * @returns {Promise<Array>} Array of professors with details
 */
export const searchByCourse = async (searchData) => {
    const { courseName, courseNumber } = searchData;

    if (!courseName || !courseNumber) {
        throw new Error('Please fill in all course search fields');
    }

    // UBC's university ID is 1413
    const universityNumber = '1413';

    // First, get the list of professors for the course
    const courseUrl = `${API_BASE_URL}/course?course_name=${encodeURIComponent(courseName)}&department_number=${encodeURIComponent(courseNumber)}&university_number=${encodeURIComponent(universityNumber)}`;
    
    const courseResponse = await apiRequest(courseUrl);
    
    if (!courseResponse.professors || courseResponse.professors.length === 0) {
        return [];
    }

    // Then, fetch detailed data for each professor in parallel
    const professorPromises = courseResponse.professors.map(async (prof) => {
        try {
            const profUrl = `${API_BASE_URL}/professor?fname=${encodeURIComponent(prof.first_name)}&lname=${encodeURIComponent(prof.last_name)}&university=${encodeURIComponent(prof.university)}`;
            
            const detailResponse = await apiRequest(profUrl);
            
            return {
                ...prof,
                details: detailResponse
            };
        } catch (error) {
            console.error(`Error fetching details for ${prof.name}:`, error);
            return {
                ...prof,
                details: { error: error.message }
            };
        }
    });

    const professorsWithDetails = await Promise.all(professorPromises);
    return professorsWithDetails;
};

/**
 * Search for a specific professor
 * @param {Object} searchData - Professor search parameters
 * @param {string} searchData.firstName - Professor's first name
 * @param {string} searchData.lastName - Professor's last name
 * @param {string} searchData.university - University name
 * @returns {Promise<Array>} Array with single professor result
 */
export const searchByProfessor = async (searchData) => {
    const { firstName, lastName, university } = searchData;
    
    if (!firstName || !lastName || !university) {
        throw new Error('Please fill in all professor search fields');
    }

    const profUrl = `${API_BASE_URL}/professor?fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(lastName)}&university=${encodeURIComponent(university)}`;
    
    const response = await apiRequest(profUrl);
    
    // Return as array for consistency with course search
    return [response];
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Server health status
 */
export const healthCheck = async () => {
    const healthUrl = `${API_BASE_URL}/health`;
    return await apiRequest(healthUrl);
};

/**
 * Get server status with environment info
 * @returns {Promise<Object>} Detailed server status
 */
export const getServerStatus = async () => {
    const statusUrl = `${API_BASE_URL}/status`;
    return await apiRequest(statusUrl);
}; 