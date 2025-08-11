# Use the official Playwright image which contains browsers and system deps.
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Set working dir
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgtk-4.so.1 \
    libgraphene-1.0.so.0 \
    libgstgl-1.0.so.0 \
    libgstcodecparsers-1.0.so.0 \
    libenchant-2.so.2 \
    libsecret-1.so.0 \
    libmanette-0.2.so.0 \
    libGLESv2.so.2
    # --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy package files first (for caching)
COPY package*.json ./

# Install production dependencies (use `npm ci` for package-lock.json)
RUN npm install

# Copy the rest of the app
COPY . .

# Start command
CMD ["npm", "start"]