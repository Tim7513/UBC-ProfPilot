const axios = require('axios');
const cheerio = require('cheerio');
const { getBrowser, createOptimizedContext } = require('./browser');

// Add headers to mimic a real browser request
const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.google.com/'
};

// UBC-specific professor search functionality

// Function to find the number of ratings a professor has for a specific course (scraped from page source)
async function getNumCourseRatings(profURL, courseCode) {
    try {
        // Fetch the page HTML
        const { data: html } = await axios.get(profURL);

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Extract raw HTML text for searching
        const pageText = $.html();

        // Build regex to match courseName + courseCount pairs
        const regex = new RegExp(
            `"courseName":"${courseCode}"\\s*,\\s*"courseCount":(\\d+)`,
            "i"
        );

        const match = pageText.match(regex);

        // If found, return the count as a number
        return match ? parseInt(match[1], 10) : 0;
    } catch (err) {
        console.error(`Error fetching or parsing ${profURL}:`, err.message);
        return 0;
    }
}

// Main function to find UBC professors with ratings for a specific course
async function findProfessorsForCourse(courseName, departmentNumber, universityNumber, callback) {
    console.log(`\nSearching for UBC professors in ${courseName} ${departmentNumber} at university ${universityNumber}`);
    console.time('Total UBC Course Search Time');

    try {
        // Get all UBC CS professors first
        const allProfessors = await getUBCProfessors(universityNumber, departmentNumber);

        if (!allProfessors || allProfessors.length === 0) {
            console.log(`No UBC CS professors found`);
            console.timeEnd('Total UBC Course Search Time');
            return callback(null, []);
        }

        console.log(`Found ${allProfessors.length} UBC CS professors`);

        // For now, return all UBC CS professors since course-specific filtering is challenging
        // In a real implementation, you might want to:
        // 1. Check professor pages for course mentions
        // 2. Use UBC's course catalog API
        // 3. Search for common course patterns
        const professorsWithCourse = allProfessors.map(prof => ({
            ...prof,
            numRatings: 0 // We'll set this to 0 for now since course-specific filtering is complex
        }));

        console.log(`\nUBC Course Search complete! Found ${professorsWithCourse.length} UBC CS professors`);
        console.timeEnd('Total UBC Course Search Time');
        callback(null, professorsWithCourse);

    } catch (error) {
        console.error('Error in findProfessorsForCourse:', error.message);
        console.timeEnd('Total UBC Course Search Time');
        callback(error, null);
    }
}

// Helper function to get UBC CS professors
async function getUBCProfessors(universityNumber, departmentNumber) {
    console.log(`Fetching UBC CS department: https://www.ratemyprofessors.com/search/professors/${universityNumber}?q=*&did=${departmentNumber}`);

    try {
        const response = await axios.get(`https://www.ratemyprofessors.com/search/professors/${universityNumber}?q=*&did=${departmentNumber}`, {
            headers,
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            const professors = [];

            $('a[href*="/professor/"]').each((index, element) => {
                const el = $(element);
                const card = el.closest('[class*="Card"], [class*="card"], div').first();

                let name = '';
                const nameSelectors = [
                    '[class*="TeacherCard__StyledTeacherCard"] [class*="CardName"]',
                    '[class*="name"]',
                    'h1, h2, h3, h4',
                    '.teacher-name',
                    '[data-testid="teacher-name"]'
                ];

                for (const selector of nameSelectors) {
                    const nameEl = card.find(selector).first();
                    if (nameEl.length > 0) {
                        name = nameEl.text().trim();
                        if (name && name.length > 2 && !name.toLowerCase().includes('load more')) {
                            break;
                        }
                    }
                }

                if (!name) {
                    name = el.text().trim();
                }

                if (!name || name.length < 3 || name.toLowerCase().includes('load more') || name.toLowerCase().includes('show more')) {
                    return;
                }

                const profURL = el.attr('href') || '';
                const fullURL = profURL.startsWith('http') ? profURL : 'https://www.ratemyprofessors.com' + profURL;

                professors.push({
                    name: name,
                    firstName: name.split(' ')[0] || '',
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    profileURL: fullURL,
                    department: departmentNumber,
                    university: 'University of British Columbia',
                    numRatings: 0
                });
            });

            return professors;
        }
    } catch (error) {
        console.log('HTTP request failed for UBC professors');
    }

    return [];
}

module.exports = findProfessorsForCourse;
