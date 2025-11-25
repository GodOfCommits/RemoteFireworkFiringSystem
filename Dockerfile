# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy index.js and public folder
COPY index.js ./
COPY public ./public

# Compile TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Install fastify and @fastify/static
RUN npm install fastify @fastify/static

# Copy application files
COPY index.js ./
COPY public ./public

# Copy compiled JavaScript (if available)
COPY --from=builder /app/public/launcher.js ./public/
COPY --from=builder /app/public/config.js ./public/
COPY --from=builder /app/public/constants.js ./public/

# Expose the port
EXPOSE 8045

# Start the application
CMD ["node", "index.js"]
