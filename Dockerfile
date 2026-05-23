# Multi-stage Dockerfile for Angular Typeahead Library

# Stage 1: Build Environment
FROM node:18-alpine AS build-env

LABEL maintainer="RM Angular Team"
LABEL description="Angular 20+ Typeahead Library Development Environment"

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Stage 2: Library Build
FROM build-env AS build-library

# Build the library
RUN npm run build:lib:prod

# Stage 3: Demo Application Build
FROM build-env AS build-demo

# Build the demo application
RUN npm run build:demo

# Stage 4: Development Environment
FROM node:18-alpine AS development

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache git chromium

# Set Chromium environment for testing
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 4200

# Default command for development
CMD ["npm", "start"]

# Stage 5: Production Web Server
FROM nginx:alpine AS production

# Copy demo application from build stage
COPY --from=build-demo /app/dist/rm-ng-typeahead-main /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S angular && \
    adduser -S angular -u 1001

# Change ownership
RUN chown -R angular:angular /usr/share/nginx/html

# Switch to non-root user
USER angular

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
