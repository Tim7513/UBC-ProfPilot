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
            
            // CSS Selector
            var wouldTakeAgain = "#root > div > div > div.PageWrapper__StyledPageWrapper-sc-3p8f0h-0.iwLXsH > div.TeacherRatingsPage__TeacherBlock-a57owa-1.gmNsKR > div.TeacherInfo__StyledTeacher-ti1fio-1.fIlNyU > div.TeacherFeedback__StyledTeacherFeedback-gzhlj7-0.jCDePN > div:nth-child(1) > div.FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf"
            var difficulty = "#root > div > div > div.PageWrapper__StyledPageWrapper-sc-3p8f0h-0.iwLXsH > div.TeacherRatingsPage__TeacherBlock-a57owa-1.gmNsKR > div.TeacherInfo__StyledTeacher-ti1fio-1.fIlNyU > div.TeacherFeedback__StyledTeacherFeedback-gzhlj7-0.jCDePN > div:nth-child(2) > div.FeedbackItem__FeedbackNumber-uof32n-1.bGrrmf"
            var overallQuality = "#root > div > div > div.PageWrapper__StyledPageWrapper-sc-3p8f0h-0.iwLXsH > div.TeacherRatingsPage__TeacherBlock-a57owa-1.gmNsKR > div.TeacherInfo__StyledTeacher-ti1fio-1.fIlNyU > div:nth-child(1) > div.RatingValue__AvgRating-qw8sqy-1.gIgExh > div > div.RatingValue__Numerator-qw8sqy-2.gxuTRq"
            var mostRecentComment = "#ratingsList > li:nth-child(1) > div > div.Rating__RatingInfo-sc-1rhvpxz-2.coQIDo > div.Comments__StyledComments-dzzyvm-0.dEfjGB"

            // JQuery Function
            const $ = cheerio.load(html); // creates Jquery function to parse through html

            // $(css_selector) ==> Jquery HTML Object for the found html tag
            const percentage = $(wouldTakeAgain).html();
            const difficultyDecimal = $(difficulty).html();
            const quality = $(overallQuality).html();
            var mostRecentCommentHtml = $(mostRecentComment).html();
            
    
            
            callback({
                percentage: percentage,
                difficulty: difficultyDecimal,
                quality: quality,
                mostRecentComment: mostRecentCommentHtml
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