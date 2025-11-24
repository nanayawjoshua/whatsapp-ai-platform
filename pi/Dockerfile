# Beeline Pi Bridge - Dockerfile
# Optimized for Raspberry Pi 4 (ARM64)

FROM node:20-slim

WORKDIR /app

# Install dependencies for Baileys
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create sessions directory
RUN mkdir -p sessions logs

# Run as non-root user
RUN useradd -m beeline && chown -R beeline:beeline /app
USER beeline

# Start the bridge
CMD ["node", "index.js"]
