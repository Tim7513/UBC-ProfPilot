# 🚀 Prof Pilot - UBC Professor & Course Explorer


Prof Pilot is a full-stack web application that empowers UBC students to make informed decisions about their courses and professors. Using real-time data from RateMyProfessors, combined with AI-powered insights, students can discover professor ratings, course difficulty, and detailed review analysis.

**🔗 Live Application**: [[https://prof-pilot.vercel.app](https://ubcprofpilot.vercel.app/)]

## ✨ Key Features

- 🔍 **Dual Search Modes**: Search by course to find all professors, or search by professor directly
- 🤖 **AI-Powered Insights**: OpenAI-powered review summarization and sentiment analysis
- 📊 **Advanced Analytics**: Tag frequency analysis and grade distribution insights
- 📱 **Mobile-Responsive**: Optimized design that works seamlessly on all devices
- ⚡ **Real-Time Data**: Live scraping from RateMyProfessors for up-to-date information
- 🎯 **Smart Filtering**: Sort by rating, difficulty, or number of reviews
- 🚀 **Production Ready**: Deployable to multiple cloud platforms

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Webpack 5** - Fast bundling and development server
- **CSS3** - Custom styling with mobile-first responsive design

### Backend
- **Node.js** - Express.js server with RESTful API
- **Playwright** - Browser automation for web scraping
- **Cheerio** - HTML parsing and data extraction
- **OpenAI API** - AI-powered review summarization and insights

### Deployment
- **Docker** - Containerized deployment with multi-stage builds
- **Railway** - Recommended deployment platform
- **Heroku** - Alternative deployment option

## 🧪 Testing

Prof Pilot includes a comprehensive testing suite that aligns with enterprise QA standards:

### Testing Framework

- **🧪 Unit Tests**: Jest with React Testing Library for component testing
- **🔗 Integration Tests**: API endpoint testing with Supertest
- **🌐 End-to-End Tests**: Playwright for cross-browser testing (PC, Mac, Chromebook)
- **📱 Mobile Testing**: Responsive design testing across devices
- **⚡ Performance Tests**: Artillery for stress and load testing
- **🔒 Security Tests**: Input validation, XSS, SQL injection prevention
- **🚀 CI/CD Pipeline**: GitHub Actions with automated testing and deployment

### Test Coverage

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit        # Unit tests with coverage
npm run test:api         # API endpoint tests
npm run test:e2e         # End-to-end tests
npm run test:mobile      # Mobile responsive tests
npm run test:performance # Load and stress tests
npm run test:security    # Security vulnerability tests

# Watch mode for development
npm run test:watch

# Generate coverage reports
npm run test:coverage
```

### Testing Features

- **Cross-Platform Testing**: Tests run on Chromium, Firefox, Safari, and mobile browsers
- **Security Testing**: Comprehensive vulnerability scanning and input validation
- **Performance Monitoring**: Load testing with realistic user scenarios
- **Accessibility Testing**: WCAG compliance and screen reader support
- **Error Handling**: Graceful degradation and error recovery testing
- **Mobile-First**: Responsive design testing across all device sizes

### Code Quality Gates

- **Linting**: ESLint with strict rules
- **Security Scanning**: Snyk and npm audit integration
- **Dependency Management**: Automated vulnerability detection
- **Code Coverage**: Minimum 70% coverage threshold
- **Performance Budgets**: Response time and resource usage limits

## 📋 Usage Examples

### Search by Course
Find all professors teaching CPSC 110:
- **Course Name**: `CPSC`
- **Course Number**: `110`
- **University ID**: `1413` (UBC's RateMyProfessors ID)

### Search by Professor
Find a specific professor:
- **First Name**: `Patrice`
- **Last Name**: `Belleville`
- **University**: `University of British Columbia`

## 🔧 API Information

The application uses a RESTful API to fetch professor and course data from RateMyProfessors. The API supports searching by course or professor with real-time data scraping and AI-powered analysis.

**Base URL**: `https://prof-pilot.vercel.app`

**Available Endpoints**:
- `GET /course` - Search professors by course
- `GET /professor` - Search professor details
- `GET /health` - Health check
- `GET /status` - Server status

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:

- Touch-friendly interface
- Bottom sheet insights panel on mobile
- Optimized search forms for small screens
- Fast loading and smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. **Write tests first** (TDD approach recommended)
4. Implement your feature
5. **Run the full test suite**: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- **🧪 Testing First**: Write tests before implementing features
- **📝 Code Style**: Follow ESLint rules and existing patterns
- **🔒 Security**: Consider security implications of changes
- **📱 Mobile-First**: Ensure responsive design works on all devices
- **⚡ Performance**: Test performance impact of changes
- **♿ Accessibility**: Maintain WCAG AA compliance
- **📚 Documentation**: Update README and guides for new features

### Testing Requirements

All contributions must include:

- **Unit tests** for new components/utilities (70%+ coverage)
- **Integration tests** for API changes
- **E2E tests** for user-facing features
- **Security tests** for input handling
- **Mobile tests** for responsive features

Run tests before submitting:
```bash
npm run test:unit     # Unit tests with coverage
npm run test:api      # API tests
npm run test:e2e      # E2E tests
npm run test:security # Security tests
```

## 📊 Performance

- **First Search**: 15-30 seconds (browser initialization)
- **Subsequent Searches**: 5-15 seconds
- **Mobile Optimized**: Responsive design with touch interactions
- **Browser Pooling**: Efficient resource management

## 🔒 Security

- API keys stored as environment variables
- CORS configured for cross-origin requests
- Input validation and sanitization
- Rate limiting ready for production deployment

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Search Error**
- Check your internet connection for live data scraping
- Some professors may have limited data on RateMyProfessors
- Try a different professor or course combination

**Long Loading Times**
- First search initializes browser (15-30 seconds)
- Subsequent searches are faster (5-15 seconds)
- Course searches take longer due to multiple professor lookups
- Large datasets may require additional processing time

**No Results Found**
- Verify the professor/course exists on RateMyProfessors
- Try alternative spellings or names
- Some professors may not have enough reviews for meaningful analysis

## 🎯 Roadmap

- [ ] Add user authentication and favorites
- [ ] Implement course comparison tools
- [ ] Add grade distribution charts
- [ ] Enhanced filtering and sorting options
- [ ] Professor availability tracking
- [ ] Course prerequisite mapping

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the demo guide for testing instructions
- Review deployment documentation for setup help

---

**Made with ❤️ for UBC students** 🎓
