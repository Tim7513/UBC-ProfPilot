const axios = require('axios');
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

function getProfData(profURL, callback) {
    console.log(`Making request to: ${profURL}`);
    
    axios.get(profURL, { 
        headers: headers,
        timeout: 10000 // 10 second timeout
    }).then(function (response) { //Callback function

        if (response.status === 200) { // valid url
            const html = response.data;
            
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
            
            // Clean up the values (remove extra whitespace, decode HTML entities, etc.)
            const cleanText = (text) => {
                if (!text) return text;
                // Create a temporary div to decode HTML entities
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                const decodedText = tempDiv.textContent || tempDiv.innerText || text;
                return decodedText.replace(/\s+/g, ' ').trim();
            };
            
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
                // Initialize comment object with empty strings for all possible attributes
                const comment = {
                    courseCode: "",
                    quality: "",
                    difficulty: "",
                    wouldTakeAgain: "",
                    forCredit: "",
                    textbook: "",
                    mandatoryAttendance: "",
                    gradeReceived: "",
                    tags: [],
                    comment: ""
                };
                
                // Extract course code
                const courseCode = $(this).find("[class*='RatingHeader'] [class*='CourseName'], [class*='ratingHeader'] [class*='courseName']").text().trim();
                if (courseCode) comment.courseCode = courseCode;
                
                // Extract quality rating (1-5)
                const qualityRating = $(this).find("[class*='RatingValues'] [class*='Quality'], [class*='ratingValues'] [class*='quality']").text().trim();
                if (qualityRating && /^[1-5](\.[\d]+)?$/.test(qualityRating)) {
                    comment.quality = parseFloat(qualityRating);
                }
                
                // Extract difficulty rating (1-5)
                const difficultyRating = $(this).find("[class*='RatingValues'] [class*='Difficulty'], [class*='ratingValues'] [class*='difficulty']").text().trim();
                if (difficultyRating && /^[1-5](\.[\d]+)?$/.test(difficultyRating)) {
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
                
                // Extract tags (but keep the empty array if no tags are found)
                $(this).find("[class*='Tag'], [class*='tag']").each(function() {
                    const tag = $(this).text().trim();
                    if (tag) comment.tags.push(tag);
                });
                if (comment.tags.length > 0) {
                    // Remove the first element only if it exists and there are more tags
                    // (the first tag is often a string of all the tags, not needed)
                    comment.tags.shift();
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
            })
        }

    }).catch(function (error) {
        console.error('Error fetching professor data:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            
            if (error.response.status === 403 || error.response.status === 429) {
                console.error('You have been blocked by RateMyProfessors. Try the following:');
                console.error('1. Wait for some time before making more requests');
                console.error('2. Use a proxy or VPN');
                console.error('3. Check if you need to solve a CAPTCHA by visiting the site in your browser');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. The request was made but no response was received');
            console.error('Request details:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up the request:', error.message);
        }
        
        // Call the callback with an error object
        callback({
            error: error.message,
            status: error.response ? error.response.status : null
        });
    });
}

module.exports = getProfData