const professorURL = require('./utils/Professor_URL')
const professorData = require('./utils/Professor_Data')
const findProfessorsForCourse = require('./utils/Course_Search')
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
                overall_quality: data.quality,
                ratings: data.ratings,
                summary: data.summary
            });
        });
    });
    


});

app.get('/course', function (req, res) {
    const courseName = req.query.course_name;
    const departmentNumber = req.query.department_number;
    const universityNumber = req.query.university_number;
    
    if (!courseName || !departmentNumber || !universityNumber) {
        return res.status(400).json({
            error: 'Missing required parameters: course_name, department_number, and university_number are required'
        });
    }
    
    findProfessorsForCourse(courseName, departmentNumber, universityNumber, (error, professors) => {
        if (error) {
            console.error('Error finding professors for course:', error.message);
            return res.status(500).json({
                error: 'Error finding professors for the specified course',
                details: error.message
            });
        }
        
        if (!professors || professors.length === 0) {
            return res.status(404).json({
                error: 'No professors found teaching the specified course',
                course_name: courseName,
                department_number: departmentNumber,
                university_number: universityNumber
            });
        }
        
        // Format the response to include professor names and relevant information
        const response = {
            course_name: courseName,
            department_number: departmentNumber,
            university_number: universityNumber,
            professors_count: professors.length,
            professors: professors.map(prof => ({
                name: prof.name,
                first_name: prof.lastName,  // First/last names are swapped
                last_name: prof.firstName,
                department: prof.department,
                university: prof.university,
                profile_url: prof.profileURL,
                num_ratings: prof.numRatings
            }))
        };
        res.json(response);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});