const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Add headers to mimic a real browser request
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
};

async function getProfData(profURL, callback) {
    console.log(`Making request to: ${profURL}`);
    
    try {
        // Launch a headless browser with optimized settings
        const browser = await puppeteer.launch({
            headless: true,
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
        
        // Navigate to the professor's page with faster settings
        await page.goto(profURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Wait a bit for initial content to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Click "Load More Ratings" button until all ratings are loaded - OPTIMIZED VERSION
        let loadMoreVisible = true;
        let previousCommentsCount = 0;
        let currentCommentsCount = 0;
        let attemptCount = 0;
        const maxAttempts = 100; // Increased limit since we're clicking faster
        let cachedButtonSelector = null; // Cache the working button selector
        
        console.log('Starting to load all ratings...');
        
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
                // Quick count of current ratings
                currentCommentsCount = await page.$$eval('[class*="Rating-"], [class*="RatingsList"] > div, [class*="Comments"] > div', elements => elements.length);
                
                // If no new comments were loaded after the first few attempts, we're done
                if (attemptCount > 2 && currentCommentsCount === previousCommentsCount) {
                    console.log(`No new ratings loaded. Final count: ${Math.floor(currentCommentsCount / 4)}`);  // divide by 4 because each rating has 3 empty elements (for some reason?)
                    loadMoreVisible = false;
                    break;
                }
                
                if (attemptCount % 5 === 0) { // Log every 5 attempts to reduce spam
                    console.log(`Attempt ${attemptCount}: ${Math.floor(currentCommentsCount / 4)} ratings loaded`);  // divide by 4 because each rating has 3 empty elements (for some reason?)
                }
                
                previousCommentsCount = currentCommentsCount;
                
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
                        
                        // Very short wait - just enough time for the click to register
                        await new Promise(resolve => setTimeout(resolve, 150));
                        
                        // Quick check if more content is loading
                        try {
                            await page.waitForFunction(
                                (expectedCount) => {
                                    const elements = document.querySelectorAll('[class*="Rating-"], [class*="RatingsList"] > div, [class*="Comments"] > div');
                                    return elements.length > expectedCount;
                                },
                                { timeout: 1500 }, // Even shorter timeout for faster iteration
                                currentCommentsCount
                            );
                            // If content loaded quickly, wait just a bit more for DOM to stabilize
                            await new Promise(resolve => setTimeout(resolve, 200));
                        } catch (e) {
                            // If timeout, continue anyway but wait a bit longer in case content is still loading
                            await new Promise(resolve => setTimeout(resolve, 400));
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
                console.log('Error while loading more ratings:', error.message);
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
        
        console.log(`Finished loading all ratings. Total: ${Math.floor(currentCommentsCount / 4)} ratings in ${attemptCount} attempts`);
        // Short final wait
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the page content after all ratings are loaded
        const html = await page.content();
        
        // Close the browser
        await browser.close();
            
            // CSS Selector - Using even more generic selectors to improve robustness
            var wouldTakeAgain = "[class*='TeacherFeedback'] div:nth-child(1) [class*='FeedbackNumber']"
            var difficulty = "[class*='TeacherFeedback'] div:nth-child(2) [class*='FeedbackNumber']"
            var overallQuality = "[class*='RatingValue'] [class*='Numerator']"

            // JQuery Function
            const $ = cheerio.load(html); // creates Jquery function to parse through html

            // $(css_selector) ==> Jquery HTML Object for the found html tag
            // Try text() method if html() doesn't work
            let percentage = $(wouldTakeAgain).html() || $(wouldTakeAgain).text();
            percentage = percentage || "N/A";
            
            let difficultyDecimal = $(difficulty).html() || $(difficulty).text();
            difficultyDecimal = difficultyDecimal || "N/A";
            
            let quality = $(overallQuality).html() || $(overallQuality).text();
            quality = quality || "N/A";
            
            // Try one more approach - look for any elements with text that might contain these values
            if (percentage === "N/A") {
                $('[class*="would-take-again"], [class*="WouldTakeAgain"]').each(function() {
                    const text = $(this).text();
                    if (text && text.trim() !== "") {
                        percentage = text;
                        return false; // break the loop
                    }
                });
            }
            
            if (difficultyDecimal === "N/A") {
                $('[class*="difficulty"], [class*="Difficulty"]').each(function() {
                    const text = $(this).text();
                    if (text && text.trim() !== "") {
                        difficultyDecimal = text;
                        return false; // break the loop
                    }
                });
            }
            
            if (quality === "N/A") {
                $('[class*="quality"], [class*="Quality"], [class*="rating"], [class*="Rating"]').each(function() {
                    const text = $(this).text();
                    if (text && text.trim() !== "" && /^\d+(\.\d+)?$/.test(text.trim())) {
                        quality = text;
                        return false; // break the loop
                    }
                });
            }
            
            // Alternative clean function if we're in Node.js environment without document
            const nodeCleanText = (text) => {
                if (!text) return text;
                // Simple HTML entity decoding for common entities
                return text
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/\s+/g, ' ')
                    .trim();
            };
            
            // Use the Node.js version of the clean function since we're in a Node.js environment
            percentage = nodeCleanText(percentage);
            difficultyDecimal = nodeCleanText(difficultyDecimal);
            quality = nodeCleanText(quality);
            // Log the values for debugging
            console.log('Would Take Again:', percentage);
            console.log('Difficulty:', difficultyDecimal);
            console.log('Quality:', quality);
            
            // If all values are N/A, log some of the HTML structure for debugging
            if (percentage === "N/A" && difficultyDecimal === "N/A" && quality === "N/A") {
                console.log('DEBUG: All values are N/A. Logging HTML structure for debugging:');
                console.log('HTML Structure Sample:', html.substring(0, 500) + '...');
                
                // Log all class names that might be relevant
                const classNames = [];
                $('[class*="rating"], [class*="Rating"], [class*="quality"], [class*="Quality"], [class*="difficulty"], [class*="Difficulty"], [class*="would"], [class*="Would"]').each(function() {
                    classNames.push($(this).attr('class'));
                });
                console.log('Relevant class names found:', classNames.slice(0, 10));
            }
            
            // Extract comments
            const comments = [];
            // Target the rating cards/comments section
            const ratingSelector = "[class*='Rating-'], [class*='RatingsList'] > div, [class*='Comments'] > div";
            
            $(ratingSelector).each(function() {
                const comment = {};
                
                // Extract course code using the specific RateMyProfessors class
                const courseCode = $(this).find("[class*='RatingHeader__StyledClass']").text().trim();
                if (courseCode) {
                    comment.courseCode = courseCode.split(" ")[0];  // Course code is duplicated, only one course code is needed
                }
                
                // Extract quality rating (1-5)
                const qualityRating = $(this).find("[class*='RatingValues'] [class*='Quality'], [class*='ratingValues'] [class*='quality']").text().trim();
                if (qualityRating && /^[1-5](\.\d+)?$/.test(qualityRating)) {
                    comment.quality = parseFloat(qualityRating);
                }
                
                // Extract difficulty rating (1-5)
                const difficultyRating = $(this).find("[class*='RatingValues'] [class*='Difficulty'], [class*='ratingValues'] [class*='difficulty']").text().trim();
                if (difficultyRating && /^[1-5](\.\d+)?$/.test(difficultyRating)) {
                    comment.difficulty = parseFloat(difficultyRating);
                }
                
                // Extract would take again
                const wouldTakeAgain = $(this).find("[class*='MetaItem']:contains('Would Take Again'), [class*='metaItem']:contains('Would Take Again')").text().trim();
                if (wouldTakeAgain) {
                    comment.wouldTakeAgain = wouldTakeAgain.toLowerCase().includes('yes') ? 'yes' : 'no';
                }
                
                // Extract for credit
                const forCredit = $(this).find("[class*='MetaItem']:contains('For Credit'), [class*='metaItem']:contains('For Credit')").text().trim();
                if (forCredit) {
                    comment.forCredit = forCredit.toLowerCase().includes('yes') ? 'yes' : 'no';
                }
                
                // Extract textbook use
                const textbook = $(this).find("[class*='MetaItem']:contains('Textbook'), [class*='metaItem']:contains('Textbook')").text().trim();
                if (textbook) {
                    const textbookLower = textbook.toLowerCase();
                    if (textbookLower.includes('yes')) {
                        comment.textbook = 'yes';
                    } else if (textbookLower.includes('no')) {
                        comment.textbook = 'no';
                    } else if (textbookLower.includes('n/a')) {
                        comment.textbook = 'N/A';
                    }
                }
                
                // Extract attendance
                const attendance = $(this).find("[class*='MetaItem']:contains('Attendance'), [class*='metaItem']:contains('Attendance')").text().trim();
                if (attendance) {
                    comment.mandatoryAttendance = attendance.toLowerCase().includes('mandatory') ? 'yes' : 'no';
                }
                
                // Extract grade
                const grade = $(this).find("[class*='MetaItem']:contains('Grade'), [class*='metaItem']:contains('Grade')").text().trim();
                if (grade) {
                    const gradeMatch = grade.match(/[A-F][+-]?/);
                    if (gradeMatch) {
                        comment.gradeReceived = gradeMatch[0];
                    }
                }
                
                const tags = [];
                $(this).find("[class*='Tag'], [class*='tag']").each(function() {
                    const tag = $(this).text().trim();
                        tags.push(tag);
                });
                tags.shift()  // Remove first element because the first element in tags is a connected string of all the tags
                if (tags.length > 0) {
                    comment.tags = tags;
                }
                
                // Extract comment text
                const commentText = $(this).find("[class*='Comments'], [class*='comments']").text().trim();
                if (commentText) {
                    comment.comment = nodeCleanText(commentText);
                }
                
                // Only add if we have at least some data
                if (Object.keys(comment).length > 0) {
                    comments.push(comment);
                }
            });
            
            // Sort comments by most recent first (assuming they're already in that order from scraping)
            callback({
                percentage: percentage,
                difficulty: difficultyDecimal,
                quality: quality,
                comments: comments
            });
        

    } catch (error) {
        console.error('Error fetching professor data:', error.message);
        
        // Call the callback with an error object
        callback({
            error: error.message,
            status: null
        });
    }
}

module.exports = getProfData