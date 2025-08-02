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
            
            callback({
                percentage: percentage,
                difficulty: difficultyDecimal,
                quality: quality
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