# Use Node.js LTS
FROM node:20-slim

# Install system dependencies for node-canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies like ts-node for now)
RUN npm install

# Copy source code
COPY . .

# Expose port (default for our backend)
EXPOSE 3001

# Start the application using ts-node
CMD ["npx", "ts-node", "server.ts"]
