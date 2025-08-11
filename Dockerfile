# Use the official Playwright image which contains browsers and system deps.
FROM mcr.microsoft.com/playwright:latest

# Set working dir
WORKDIR /usr/src/app

# Don't let Playwright's postinstall try to download browsers — the base image already has them.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

# Copy package files first (for caching)
COPY package*.json ./

# Install production dependencies (use `npm ci` for package-lock.json)
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Start command
CMD ["npm", "start"]