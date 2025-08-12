# Use the official Playwright image which contains browsers and system deps.
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

# Set working dir
WORKDIR /app

# Install system dependencies
RUN npx playwright install-deps
RUN npx playwright install --with-deps webkit
RUN apt-get update && apt-get install -y \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libmanette-0.2-0 \
    libgles2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy package files first (for caching)
COPY package*.json ./

# Install production dependencies (use `npm ci` for package-lock.json)
RUN npm install

# Copy the rest of the app
COPY . .

# Start command
CMD ["npm", "start"]