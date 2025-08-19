# 🚀 Prof Pilot Deployment Guide

This guide covers multiple deployment options for your Prof Pilot application, from beginner-friendly to advanced setups.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- ✅ **Git Repository** - Push your code to GitHub/GitLab
- ✅ **Environment Variables** - Your `.env` file configured locally

## 🌟 Recommended Deployment Options

### Option 1: Railway (⭐ **RECOMMENDED** - Easiest)

Railway is perfect for Node.js apps with browser automation. It handles Playwright dependencies automatically.

#### **Why Railway?**
- ✅ **Zero Configuration** - Deploys automatically from GitHub
- ✅ **Playwright Support** - Handles browser dependencies out of the box
- ✅ **Free Tier** - $5/month credit, perfect for testing
- ✅ **Fast Deploys** - Usually under 2 minutes
- ✅ **Auto HTTPS** - SSL certificates included

#### **Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Connect Repository**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `ubc-prof-pilot` repository
   - Railway will auto-detect it's a Node.js app

4. **Set Environment Variables**
   - Go to your project → Variables tab
   - Add: `OPENAI_API_KEY` = `your_actual_api_key`
   - Add: `PORT` = `3000` (Railway will override this automatically)

5. **Deploy**
   - Railway starts building automatically
   - Get your URL from the Deployments tab
   - Visit `https://your-app.railway.app/app`

**Total Time: ~5 minutes** ⚡

---

### Option 2: Heroku (Good Alternative)

Heroku is a popular platform but requires a buildpack for Playwright.

#### **Why Heroku?**
- ✅ **Popular Platform** - Well-documented
- ✅ **Git-based Deploys** - Push to deploy
- ✅ **Add-ons Available** - Monitoring, databases, etc.
- ⚠️ **Requires Buildpack** - Extra setup for Playwright

#### **Steps:**

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-prof-pilot-app
   ```

3. **Add Buildpacks**
   ```bash
   # Add Node.js buildpack
   heroku buildpacks:add heroku/nodejs
   
   # Add Playwright buildpack for browser support
   heroku buildpacks:add https://github.com/mxschmitt/heroku-playwright-buildpack
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_actual_api_key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Open Your App**
   ```bash
   heroku open
   # Then navigate to /app
   ```

**Total Time: ~10 minutes** ⚡

---

### Option 3: Vercel (Serverless - Advanced)

⚠️ **Not Recommended** for this app due to Playwright browser requirements and long execution times.

---

### Option 4: DigitalOcean App Platform

Good for production with more control over resources.

#### **Why DigitalOcean?**
- ✅ **Predictable Pricing** - $5/month for basic apps
- ✅ **Good Performance** - Dedicated resources
- ✅ **Docker Support** - Can use our Dockerfile
- ⚠️ **More Complex** - Requires more setup

#### **Steps:**

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Sign up and verify account

2. **Create App**
   - Go to Apps → Create App
   - Connect your GitHub repository
   - Select `ubc-prof-pilot` repo

3. **Configure Build**
   - **Source Directory**: `/` (root)
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`

4. **Set Environment Variables**
   - Add `OPENAI_API_KEY` with your key
   - Add `NODE_ENV=production`

5. **Configure Resources**
   - **Plan**: Basic ($5/month minimum)
   - **Instances**: 1
   - **Memory**: 512MB minimum (1GB recommended)

6. **Deploy**
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)
   - Get your app URL

**Total Time: ~15 minutes** ⚡

---

### Option 5: Docker + Any Cloud Provider

For maximum control and portability.

#### **Using Our Dockerfile:**

1. **Build Image**
   ```bash
   docker build -t prof-pilot .
   ```

2. **Test Locally**
   ```bash
   docker run -p 3000:3000 -e OPENAI_API_KEY=your_key prof-pilot
   ```

3. **Deploy to Cloud**
   - **Google Cloud Run** - Serverless containers
   - **AWS ECS** - Container service
   - **Azure Container Instances** - Simple container hosting

---

## 🔧 Environment Variables for All Platforms

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=production

# Optional
PORT=3000          # Usually set by platform
DEBUG_MODE=false
VERBOSE_LOGGING=false
```

## 🎯 Testing Your Deployment

After deployment, test these key features:

### **1. Basic Functionality**
- Visit `https://your-app-url/app`
- Try a course search: CPSC 110 at UBC
- Try a professor search: Any UBC professor

### **2. API Endpoints**
- `GET /` - Should return API welcome message
- `GET /course?course_name=CPSC&department_number=110&university_number=1413`
- `GET /professor?fname=John&lname=Smith&university=University of British Columbia`

### **3. Performance Check**
- First search: 15-30 seconds (browser initialization)
- Subsequent searches: 5-15 seconds
- Mobile responsiveness
- AI summary generation

## 🚨 Common Deployment Issues

### **Issue 1: Playwright Installation Fails**
```bash
# Solution: Ensure postinstall script runs
npm run postinstall
```

### **Issue 2: OpenAI API Errors**
```bash
# Check environment variable is set
echo $OPENAI_API_KEY
# Should show your API key
```

### **Issue 3: Memory Issues**
- **Symptoms**: App crashes during scraping
- **Solution**: Upgrade to plan with ≥1GB RAM
- **Railway**: Upgrade plan
- **Heroku**: Use `standard-1x` dyno or higher

### **Issue 4: Timeout Errors**
- **Symptoms**: "Search Error" after 30 seconds
- **Solution**: Platform-specific timeout increases
- **Railway**: Automatic (handles long requests)
- **Heroku**: Set `WEB_CONCURRENCY=1` to reduce memory usage

### **Issue 5: Browser Launch Failures**
```bash
# Check if Playwright installed correctly
npx playwright install --dry-run webkit
```

## 📊 Platform Comparison

| Platform | Ease | Cost | Performance | Playwright Support |
|----------|------|------|-------------|-------------------|
| **Railway** | ⭐⭐⭐⭐⭐ | $5/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Heroku** | ⭐⭐⭐⭐ | $7/month | ⭐⭐⭐ | ⭐⭐⭐ |
| **DigitalOcean** | ⭐⭐⭐ | $5/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Docker** | ⭐⭐ | Varies | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔐 Security Considerations

1. **API Keys**: Never commit API keys to Git
2. **HTTPS**: All platforms provide SSL certificates
3. **Rate Limiting**: Consider adding rate limiting for production
4. **CORS**: Already configured for cross-origin requests

## 📈 Scaling Considerations

### **For High Traffic:**
1. **Multiple Instances**: Scale horizontally
2. **Database**: Add Redis for caching professor data
3. **CDN**: Use CloudFlare for static file delivery
4. **Load Balancer**: Distribute requests across instances

### **Cost Optimization:**
1. **Sleep Mode**: Railway/Heroku sleep inactive apps
2. **Caching**: Cache professor data to reduce API calls
3. **Browser Pooling**: Already implemented for efficiency

## 🎉 Success!

Once deployed, your Prof Pilot app will be available at:
- **Railway**: `https://your-app.railway.app/app`
- **Heroku**: `https://your-app.herokuapp.com/app`
- **DigitalOcean**: `https://your-app.ondigitalocean.app/app`

Share the URL and let UBC students discover their perfect professors! 🎓

---

**Need Help?** 
- Check the logs on your platform's dashboard
- Test the API endpoints directly
- Verify environment variables are set correctly 