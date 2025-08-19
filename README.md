# Prof Pilot - UBC Professor & Course Explorer

Prof Pilot is a full-stack web application that lets UBC students explore professors and courses using real-time data from RateMyProfessors. It features AI-powered review summarization, advanced filtering, and comprehensive analytics.

## 🌟 Features

### Core Features
- **Search by Course**: View professors who have taught the course, with detailed RateMyProf reviews and stats
- **Search by Professor**: View courses they've taught, rating summaries, tag distribution, and detailed analytics
- **AI Summarization**: Condenses dozens of reviews into clear, meaningful insights using GPT-4o-mini
- **Tag Analytics**: Professors can be described as "strict", "organized", "easy A" with percentage breakdowns
- **Advanced Filtering**: Filter by rating, difficulty, and other criteria
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Technical Features
- **Browser Pool Management**: Optimized Playwright browser instances for efficient scraping
- **Resource Blocking**: Blocks images, stylesheets, and fonts for faster page loading
- **Rate Limiting**: Intelligent request management to avoid being blocked
- **Error Handling**: Graceful fallbacks and comprehensive error reporting
- **Real-time Data**: Fresh data scraped directly from RateMyProfessors

## 🏗️ Architecture

### Three-Panel Frontend Design

#### 1. Search Panel (Top Bar)
**Purpose**: Entry point where users choose search type and enter queries

**Features**:
- Toggle between "Search by Course" and "Search by Professor"
- Dynamic form fields based on search type
- Advanced search options (collapsible)
- Real-time validation

**Search Types**:
- **Course Search**: Course Name (e.g., CPSC) + Course Number (e.g., 110) + University ID (e.g., 1413)
- **Professor Search**: First Name + Last Name + University Name

#### 2. Results Panel (Main Content)
**Purpose**: Displays interactive cards for search results

**Features**:
- **Course Search Mode**: Grid of professors who taught that course
- **Professor Search Mode**: Detailed professor information and course history
- **Interactive Cards**: Click to select and view insights
- **Sorting Options**: Sort by rating, difficulty, or number of reviews
- **Loading States**: Animated spinners during data fetching

**Card Information**:
- Professor name and department
- Overall quality rating (color-coded: red/yellow/green)
- Difficulty rating (1-5 scale)
- "Would Take Again" percentage
- Number of reviews
- Top tags (e.g., "strict", "organized", "easy A")

#### 3. Insights Panel (Right Sidebar/Bottom on Mobile)
**Purpose**: AI-powered deep dive into selected professor/course data

**Features**:
- **AI Summary**: GPT-4o-mini generated summary of all reviews
- **Tag Analytics**: Interactive progress bars showing tag frequency
- **Quick Stats**: Key metrics at a glance
- **Grade Distribution**: A/B grade percentages

**Mobile Behavior**:
- Collapses to bottom sheet
- Swipe up to expand
- Touch-friendly interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- OpenAI API key (for AI summarization)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ubc-prof-pilot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

4. **Start the server**
```bash
npm start
```

5. **Open the application**
Navigate to `http://localhost:3000` and open `client/index.html` in your browser.

## 🔧 Backend API Architecture

### API Endpoints

#### `/professor`
**Purpose**: Get detailed professor information including ratings and AI summary

**Parameters**:
- `fname` (required): Professor's first name
- `lname` (required): Professor's last name  
- `university` (required): University name

**Response**:
```json
{
  "URL": "https://www.ratemyprofessors.com/professor/...",
  "first_name": "John",
  "last_name": "Smith", 
  "university": "University of British Columbia",
  "would_take_again": "75%",
  "difficulty": "3.2",
  "overall_quality": "4.1",
  "ratings": [...], // Array of individual ratings
  "summary": "AI-generated summary of reviews..."
}
```

#### `/course`
**Purpose**: Find all professors who have taught a specific course

**Parameters**:
- `course_name` (required): Course department (e.g., "CPSC")
- `department_number` (required): Course number (e.g., "110")
- `university_number` (required): University ID (e.g., "1413")

**Response**:
```json
{
  "course_name": "CPSC",
  "department_number": "110", 
  "university_number": "1413",
  "professors_count": 5,
  "professors": [
    {
      "name": "John Smith",
      "first_name": "John",
      "last_name": "Smith",
      "department": "Computer Science",
      "university": "University of British Columbia",
      "profile_url": "https://www.ratemyprofessors.com/professor/...",
      "num_ratings": 47
    }
  ]
}
```

### Backend Components

#### `utils/Professor_Data.js`
- **Primary scraping engine** for individual professor pages
- Uses Playwright browser pool for efficient scraping
- Implements "Load More" clicking to get all reviews
- Extracts ratings, tags, grades, and metadata
- **AI Integration**: Uses OpenAI GPT-4o-mini to summarize reviews
- Handles rate limiting and error recovery

#### `utils/Course_Search.js`  
- **Course-based professor discovery**
- Searches RateMyProfessors by department and university
- Loads all professors using pagination
- Filters and formats results

#### `utils/Professor_URL.js`
- **Professor URL generation** from name and university
- Handles name variations and university matching
- Returns RateMyProfessors profile URLs

#### `utils/browser.js`
- **Browser pool management** for Playwright instances
- Optimized browser configurations for speed
- Resource blocking (images, CSS, fonts)
- Connection reuse and cleanup

### Frontend-Backend Integration

#### Search Flow

1. **User Input**: User selects search type and enters data
2. **Frontend Validation**: JavaScript validates required fields
3. **API Request**: AJAX call to appropriate endpoint (`/course` or `/professor`)
4. **Backend Processing**: 
   - Course search: Find professors → Fetch individual details in parallel
   - Professor search: Direct profile scraping
5. **Data Enhancement**: Extract tags, calculate stats, generate AI summary
6. **Response Handling**: Frontend processes results and updates UI
7. **Insights Generation**: Selected professor data is analyzed for insights panel

#### Data Flow Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Search Panel  │────│   JavaScript     │────│   Backend API       │
│   (User Input)  │    │   (Validation &  │    │   (/course or       │
└─────────────────┘    │    AJAX)         │    │    /professor)      │
                       └──────────────────┘    └─────────────────────┘
                                │                         │
                                │                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Insights Panel  │◄───│  Results Panel   │◄───│  RateMyProfessors   │
│ (AI + Analytics)│    │  (Cards Display) │    │   (Web Scraping)    │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## 🎨 UI/UX Design Principles

### Visual Design
- **Glassmorphism**: Semi-transparent panels with backdrop blur
- **Gradient Backgrounds**: Purple-blue gradient for modern feel
- **Color-Coded Ratings**: Red (low), yellow (medium), green (high)
- **Micro-animations**: Smooth hover effects and transitions
- **Typography**: Inter font for clean, readable text

### Responsive Behavior
- **Desktop**: Three-panel layout with sidebar insights
- **Tablet**: Stacked layout with collapsible insights
- **Mobile**: Single column with bottom sheet insights

### Performance Optimizations
- **Lazy Loading**: Results load as needed
- **Debounced Search**: Prevents excessive API calls
- **Parallel Requests**: Multiple professor details fetched simultaneously
- **Browser Resource Blocking**: 3x faster page loads
- **Connection Pooling**: Reused browser instances

## 🔍 Example Usage

### Search by Course
1. Select "Search by Course"
2. Enter: Course Name: "CPSC", Course Number: "110", University ID: "1413"
3. Click Search
4. View professors who taught CPSC 110 at UBC
5. Click a professor card to see detailed insights

### Search by Professor  
1. Select "Search by Professor"
2. Enter: First Name: "John", Last Name: "Smith", University: "University of British Columbia"
3. Click Search
4. View detailed professor information
5. Explore AI summary and tag analytics in insights panel

## 🛠️ Development Status

**Current Status**: ✅ Active Development Complete

**Completed Features**:
- ✅ Three-panel responsive UI
- ✅ Course and professor search
- ✅ AI-powered review summarization  
- ✅ Tag analytics and insights
- ✅ Browser pool optimization
- ✅ Error handling and validation
- ✅ Mobile-responsive design

**Future Enhancements**:
- 🔄 GPA data integration
- 🔄 Course comparison features
- 🔄 Professor recommendation engine
- 🔄 Historical trend analysis
- 🔄 User favorites and bookmarks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application scrapes data from RateMyProfessors.com for educational purposes. Please respect the website's terms of service and use responsibly. The AI summaries are generated automatically and may not reflect the complete context of all reviews.
