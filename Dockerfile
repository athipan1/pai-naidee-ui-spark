# Production-ready multi-stage Dockerfile for pai-naidee-ui-spark

# Stage 1: Build dependencies and application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production runtime with nginx
FROM nginx:1.25-alpine AS production

# Create nodejs group for security
RUN addgroup -g 1001 -S nodejs

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nodejs /usr/share/nginx/html && \
    chown -R nginx:nodejs /var/cache/nginx && \
    chown -R nginx:nodejs /var/log/nginx && \
    chown -R nginx:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
