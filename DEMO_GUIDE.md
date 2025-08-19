# Prof Pilot Demo Guide

This guide will help you test the Prof Pilot application with real examples once it's running.

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open the application**:
   Navigate to `http://localhost:3000/app` in your browser

## 📋 Test Cases

### Test Case 1: Search by Course (CPSC 110 at UBC)

**Steps**:
1. Select "Search by Course" (default)
2. Fill in the form:
   - **Course Name**: `CPSC`
   - **Course Number**: `110` 
   - **University ID**: `1413` (UBC's ID on RateMyProfessors)
3. Click "Search"

**Expected Results**:
- List of professors who have taught CPSC 110
- Each card shows rating, difficulty, and "would take again" percentage
- Click any professor card to see detailed insights
- AI summary appears in the insights panel
- Tag analytics show common descriptors

### Test Case 2: Search by Professor

**Steps**:
1. Select "Search by Professor"
2. Fill in the form:
   - **First Name**: `Patrice` (or any known UBC CS professor)
   - **Last Name**: `Belleville`
   - **University**: `University of British Columbia`
3. Click "Search"

**Expected Results**:
- Detailed professor information card
- AI-generated summary of all reviews
- Tag frequency analytics
- Quick stats showing grade distribution

### Test Case 3: Mobile Responsive Testing

**Steps**:
1. Open browser developer tools (F12)
2. Switch to mobile view (iPhone/Android simulation)
3. Perform either search test above

**Expected Results**:
- Search panel stacks vertically
- Results display in single column
- Insights panel becomes a bottom sheet
- All interactions remain touch-friendly

## 🔍 Features to Test

### Search Panel Features
- ✅ Toggle between course and professor search
- ✅ Form validation (try submitting empty fields)
- ✅ Advanced search toggle (expand/collapse)
- ✅ Enter key search (press Enter in any input field)

### Results Panel Features  
- ✅ Color-coded rating badges (red/yellow/green)
- ✅ Sorting dropdown (by rating, difficulty, reviews)
- ✅ Card selection (click different cards)
- ✅ Loading states during search
- ✅ Error handling (try invalid data)

### Insights Panel Features
- ✅ AI summary generation
- ✅ Tag analytics with progress bars
- ✅ Quick stats grid
- ✅ Mobile bottom sheet behavior

## 🛠️ Troubleshooting

### Common Issues

**1. "Search Error" appears**
- Check that the server is running on port 3000
- Verify internet connection (scrapes live data)
- Try a different professor/course combination

**2. "No detailed insights available"**
- Some professors may have limited data on RateMyProfessors
- Try a professor with more reviews (20+ reviews work best)

**3. Loading takes a long time**
- Initial searches may take 10-30 seconds
- The app loads ALL reviews for comprehensive analysis
- Subsequent searches use browser pooling for speed

**4. OpenAI API errors**
- Ensure OPENAI_API_KEY is set in .env file
- Check your OpenAI account has credits
- Summary will show error message if API fails

### Performance Notes

- **First search**: May take 15-30 seconds (initializing browser)
- **Subsequent searches**: Usually 5-15 seconds  
- **Course searches**: Longer due to multiple professor lookups
- **Professor searches**: Faster, single profile lookup

## 📊 Sample Data for Testing

### UBC Course Examples
- **CPSC 110**: Introduction to Programming (many professors)
- **CPSC 210**: Software Construction
- **MATH 100**: Differential Calculus  
- **ENGL 110**: University Writing

### UBC Professor Examples
- Computer Science: Search for common CS professor names
- Mathematics: Try math professors
- English: Try English department professors

**Note**: Use real professor names that exist on RateMyProfessors for best results.

## 🎯 Success Criteria

A successful demo should show:
1. ✅ **Fast, responsive UI** with smooth animations
2. ✅ **Accurate data scraping** from RateMyProfessors
3. ✅ **Meaningful AI summaries** that capture review sentiment
4. ✅ **Useful tag analytics** showing professor characteristics
5. ✅ **Mobile-friendly design** that works on all devices
6. ✅ **Error handling** with helpful messages

## 🔗 Next Steps

After testing, consider:
- Adding your favorite professors/courses to test with
- Exploring the tag analytics for patterns
- Trying the mobile interface on a real device
- Testing with professors from different departments

---

**Tip**: The application works best with professors who have 10+ reviews on RateMyProfessors, as this provides more data for AI analysis and tag extraction. 