const professorURL = require('./utils/Professor_URL')
const professorData = require('./utils/Professor_Data')
const express = require('express');
var app = express();
const cors = require('cors');

app.use(cors());

app.get('/', function (req, res) {
    res.json('WELCOME TO THE RATE MY PROFESSOR API' );
});


app.get('/professor', function (req, res) {
    const fname = req.query.fname;
    const lname = req.query.lname;
    const university = req.query.university;
    
    if (!fname || !lname || !university) {
        return res.status(400).json({
            error: 'Missing required parameters: fname, lname, and university are required'
        });
    }
    
    professorURL(fname, lname, university, (urlResponse) => {
        if (!urlResponse || !urlResponse.URL) {
            return res.status(404).json({
                error: 'Professor not found or error generating URL',
                details: urlResponse ? urlResponse.error : 'No response from URL generator'
            });
        }
        
        console.log(`Fetching data for: ${urlResponse.URL}`);
        
        professorData(urlResponse.URL, (data) => {
            if (data.error) {
                console.error('Error from professorData:', data.error);
                return res.status(500).json({
                    error: 'Error fetching professor data',
                    details: data.error,
                    status: data.status
                });
            }
            
            res.json({
                URL: urlResponse.URL,
                first_name: urlResponse.lname,  // First/last names are swapped
                last_name: urlResponse.fname,
                university: urlResponse.university,
                would_take_again: data.percentage,
                difficulty: data.difficulty,
                overall_quality: data.quality
            });
        });
    });
    


});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
