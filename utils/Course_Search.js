const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Add headers to mimic a real browser request
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.ratemyprofessors.com/'
};

// Function to search for all professors in a department at a university
async function searchProfessorsByDepartment(universityNumber, departmentNumber, callback) {
    const searchURL = `https://www.ratemyprofessors.com/search/professors/${universityNumber}?q=*&did=${departmentNumber}`;
    console.log(`Fetching URL: ${searchURL}`);

    try {
        // Launch a headless browser with optimized settings
        const resolvedExecutablePath = (() => {
            const candidate = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
            try {
                require('fs').accessSync(candidate);
                return candidate;
            } catch (_) {
                return undefined; // Let Puppeteer find its own bundled browser
            }
        })();

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: resolvedExecutablePath,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-default-apps',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows'
            ]
        });
        
        // Start timing
        console.time('Professor Load Time');
        
        // Create a new page
        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent(headers['User-Agent']);
        
        // Block unnecessary resources to speed up page loading
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        // Navigate to the department search page
        await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Click "Load More" button until all professors are loaded - EXACT SAME IMPLEMENTATION FROM getProfData
        // Try to get total number of professors from any header/indicator
        let totalProfessors = 0;
        try {
            // Look for any element that might contain the total count
            const countElement = await page.$("[class*='results'], [class*='Results'], [class*='count'], [class*='Count']");
            if (countElement) {
                const countText = await page.evaluate(el => el.textContent, countElement);
                const match = countText.match(/(\d+)/);
                if (match) {
                    totalProfessors = parseInt(match[1]);
                }
            }
        } catch (e) {
            // If we can't find the count, we'll use a fallback
        }
        
        const maxAttempts = Math.ceil(totalProfessors / 5 * 1.2) || 100; // Estimate based on professors per page, fallback to 100
        console.log('Estimated total professors:', totalProfessors || 'unknown');
        
        let loadMoreVisible = true;
        let currentProfessorsCount = 0;
        let attemptCount = 0;
        let cachedButtonSelector = null; // Cache the working button selector
        
        console.log('\nStep 1: Starting to load all professors...');
        
        // First, try to find and cache the working button selector
        const findButtonSelector = async () => {
            if (cachedButtonSelector) {
                const button = await page.$(cachedButtonSelector);
                if (button) return button;
            }
            
            // Try to find the button using the most common selectors first
            const commonSelectors = [
                'button[class*="loadMore"]',
                'button[class*="LoadMore"]',
                'button[class*="PaginationButton"]',
                'button[class*="Buttons__Button"]',
                'button[class*="pagination"]',
                'button[class*="Pagination"]'
            ];
            
            for (const selector of commonSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        cachedButtonSelector = selector;
                        return button;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            // Fallback to more comprehensive search
            return await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(el => 
                    el.textContent && (
                        el.textContent.includes('Load More') ||
                        el.textContent.includes('Show More') ||
                        el.textContent.includes('More')
                    )
                ) || null;
            });
        };
        
        while (loadMoreVisible && attemptCount < maxAttempts) {
            try {
                // Quick count of current professors
                currentProfessorsCount = await page.$$eval("a.TeacherCard__StyledTeacherCard-syjs0d-0", elements => elements.length);
                
                if (attemptCount % 5 === 0) { // Log every 5 attempts to reduce spam
                    console.log(`Attempt ${attemptCount}: ${currentProfessorsCount} professors loaded`);
                }
                
                // Find the load more button
                const loadMoreButton = await findButtonSelector();
                
                if (loadMoreButton && loadMoreButton.asElement) {
                    // Quick visibility check
                    const isVisible = await page.evaluate(button => {
                        if (!button) return false;
                        const rect = button.getBoundingClientRect();
                        const style = window.getComputedStyle(button);
                        return rect.width > 0 && rect.height > 0 && 
                               style.display !== 'none' && 
                               style.visibility !== 'hidden' && 
                               style.opacity !== '0';
                    }, loadMoreButton);
                    
                    if (isVisible) {
                        // Click the button
                        await loadMoreButton.click();
                        attemptCount++;
                        
                        // Quick check if more content is loading
                        try {
                            await page.waitForFunction(
                                (expectedCount) => {
                                    const elements = document.querySelectorAll("a.TeacherCard__StyledTeacherCard-syjs0d-0");
                                    return elements.length > expectedCount;
                                },
                                { timeout: 1500 }, // Short timeout for faster iteration
                                currentProfessorsCount
                            );
                        } catch (e) {
                            // If timeout, continue anyway but wait a bit longer in case content is still loading
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    } else {
                        console.log('Load More button no longer visible');
                        loadMoreVisible = false;
                    }
                } else {
                    console.log('Load More button not found');
                    loadMoreVisible = false;
                }
            } catch (error) {
                console.log('Error while loading more professors:', error.message);
                attemptCount++;
                
                // More lenient error handling - only stop after many errors
                if (attemptCount > 10 && error.message.includes('click')) {
                    console.log('Multiple click errors occurred, stopping.');
                    loadMoreVisible = false;
                }
            }
        }
        
        if (attemptCount >= maxAttempts) {
            console.log(`Reached maximum attempts (${maxAttempts}), stopping.`);
        }

        if (totalProfessors > 0 && totalProfessors > currentProfessorsCount) {
            console.log('WARNING: Not all professors were successfully loaded')
        }
        
        console.log(`Finished loading all professors. Total: ${currentProfessorsCount} professors in ${attemptCount} attempts`);
        
        // Get the page content after all professors are loaded
        const html = await page.content();
        console.timeEnd('Professor Load Time');
        
        // Close the browser
        await browser.close();
        
        // Parse the HTML to extract professor information
        const $ = cheerio.load(html);
        const liSelector = "a.TeacherCard__StyledTeacherCard-syjs0d-0";
        const cards = $(liSelector);
        
        console.log(`Found ${cards.length} professor cards in department`);

        const professors = [];
        
        // Process each professor card
        $(liSelector).each(function(index) {
            const card = $(this);
            const nameElement = card.find("div.CardName__StyledCardName-sc-1gyrgim-0");
            const name = nameElement.text().trim();
            
            // Get the department information
            const departmentElement = card.find("div.CardSchool__Department-sc-19lmz2k-0");
            const departmentText = departmentElement.text().trim();
            
            // Get the university information
            const universityElement = card.find("div.CardSchool__School-sc-19lmz2k-1");
            const universityText = universityElement.text().trim();
            
            const profPath = card.attr('href');
            
            if (name && profPath) {
                const profURL = `https://www.ratemyprofessors.com${profPath}`;
                
                // Parse name (RMP shows Last, First format)
                const nameParts = name.split(' ');
                const lastName = nameParts[0].replace(',', '');
                const firstName = nameParts.slice(1).join(' ');
                
                professors.push({
                    name: name,
                    firstName: firstName,
                    lastName: lastName,
                    department: departmentText,
                    university: universityText,
                    profileURL: profURL
                });
                
                console.log(`Found professor: ${name} - ${profURL}`);
            }
        });
        
        console.log(`Total professors found: ${professors.length}`);
        callback(null, professors);
        
    } catch (error) {
        console.error('Error in searchProfessorsByDepartment:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            if (error.response.status === 403 || error.response.status === 429) {
                console.error('You have been blocked by RateMyProfessors. Try again later.');
            }
        }
        callback(error, null);
    }
}

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

// Main function to find professors with ratings for a specific course
async function findProfessorsForCourse(courseName, departmentNumber, universityNumber, callback) {
    console.log(`\nSearching for professors with ratings for ${courseName} in department ${departmentNumber} at university ${universityNumber}`);
    console.time('Total Course Search Time');
    try {
        // Step 1: Get all professors in the department
        searchProfessorsByDepartment(universityNumber, departmentNumber, async (error, professors) => {
            if (error) {
                return callback(error, null);
            }
            
            if (!professors || professors.length === 0) {
                return callback(new Error('No professors found in the specified department'), null);
            }
            
            console.log(`\nStep 2: Checking ${professors.length} professors for course ${courseName}...`);
            
            const professorsWithCourse = [];
            let processedCount = 0;
            
            // Start timing the number of course ratings check
            console.time('Check Course Ratings Time');

            // Process professors sequentially to avoid overwhelming the server
            for (const professor of professors) {
                try {
                    processedCount++;
                    console.log(`Processing ${processedCount}/${professors.length}: ${professor.name}`);
                    
                    const numRatings = await getNumCourseRatings(professor.profileURL, courseName);
                    
                    if (numRatings > 0) {
                        professorsWithCourse.push({
                            name: professor.name,
                            firstName: professor.firstName,
                            lastName: professor.lastName,
                            department: professor.department,
                            university: professor.university,
                            profileURL: professor.profileURL,
                            numRatings: numRatings
                        });
                        console.log(`✓ ${professor.name} has ratings for ${courseName}`);
                    }
                    
                } catch (error) {
                    console.error(`Error processing professor ${professor.name}:`, error.message);
                }
            }
            
            console.log(`\nSearch complete! Found ${professorsWithCourse.length} professors with ratings for ${courseName}`);
            console.timeEnd('Check Course Ratings Time');
            console.timeEnd('Total Course Search Time');
            callback(null, professorsWithCourse);
        });
        
    } catch (error) {
        console.error('Error in findProfessorsForCourse:', error.message);
        callback(error, null);
    }
}

module.exports = findProfessorsForCourse;