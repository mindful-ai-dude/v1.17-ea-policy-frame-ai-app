FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy all files
COPY . .

# Generate development certificates
RUN pnpm run generate-certs

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/certs ./certs

# Copy environment files
COPY .env.production ./

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]