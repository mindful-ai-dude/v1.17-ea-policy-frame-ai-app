# PolicyFrame App Deployment Guide

This document provides instructions for deploying the PolicyFrame App to production environments.

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Access to Convex deployment credentials
- Google Gemini API key (for production)
- SSL certificate for your domain (for production)

## Environment Setup

### 1. Environment Variables

The application uses different environment files for development and production:

- `.env.local` - Development environment variables
- `.env.production` - Production environment variables

Before deployment, update the `.env.production` file with your production values:

```bash
# Convex deployment for production
CONVEX_DEPLOYMENT=prod:your-production-deployment-id
VITE_CONVEX_URL=https://your-production-deployment-id.convex.cloud

# API configuration
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000

# Google Gemini API key
GEMINI_API_KEY=your-gemini-api-key

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Performance monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_ENDPOINT=https://metrics.yourdomain.com/collect
```

### 2. Convex Setup

1. Create a production deployment in Convex:

```bash
pnpm run deploy:convex
```

2. Note the deployment ID and URL, and update your `.env.production` file.

## Build Process

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build for Production

```bash
pnpm run build
```

This will:
- Compile TypeScript
- Bundle and optimize assets
- Generate a service worker
- Apply compression
- Create a production-ready build in the `dist` directory

## Deployment Options

### Option 1: Docker Deployment

The application includes a Dockerfile for containerized deployment:

1. Build the Docker image:
```bash
docker build -t ea-policy-frame-app .
```

2. Run the container:
```bash
docker run -p 8080:8080 -e GEMINI_API_KEY=your-api-key ea-policy-frame-app
```

3. For production, consider using Docker Compose or Kubernetes for orchestration.

### Option 2: Static Hosting (Frontend Only)

For platforms like Vercel, Netlify, or AWS S3 + CloudFront:

1. Configure your hosting platform to use the `dist` directory
2. Set up environment variables in your hosting platform
3. Configure redirects to handle client-side routing:

```
/* /index.html 200
```

### Option 3: Full-Stack Deployment

For platforms like Heroku, AWS Elastic Beanstalk, or Digital Ocean:

1. Configure your server to serve static files from the `dist` directory
2. Set up the Express.js server to handle API requests
3. Configure HTTPS and security headers

Example server start command:
```bash
NODE_ENV=production node server/index.js
```

## Security Configuration

### 1. HTTPS Enforcement

The application is configured to enforce HTTPS in production. Make sure your hosting environment supports HTTPS.

### 2. Content Security Policy

The application uses a strict Content Security Policy. If you need to allow additional domains:

1. Update the CSP directives in `server/index.ts`
2. Rebuild the application

### 3. API Key Management

Ensure that API keys are securely stored and never exposed to the client. The application encrypts API keys before storing them in Convex.

## Performance Monitoring

The application includes built-in performance monitoring:

1. Set `VITE_PERFORMANCE_MONITORING=true` in your environment
2. Configure `VITE_PERFORMANCE_ENDPOINT` to point to your metrics collection service
3. Metrics will be sampled and sent to your endpoint

## Scaling Considerations

### 1. Rate Limiting

The Express server includes rate limiting to protect against abuse. Adjust the limits in `server/index.ts` based on your expected traffic.

### 2. Caching Strategy

- Static assets are configured with long cache times and include content hashes for cache busting
- Consider implementing a CDN for global distribution
- Convex provides automatic scaling for the backend

## Monitoring and Logging

### 1. Health Check Endpoint

The application provides a health check endpoint at `/health` that returns:
- Current status
- Environment
- Version
- Timestamp

Use this endpoint for monitoring service health.

### 2. Error Logging

In production, errors are logged without sensitive details. Set up a logging service to capture and alert on errors.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check the CORS configuration in `server/index.ts` to ensure your domains are properly allowed.

2. **API Key Issues**: Verify that API keys are correctly set and have the necessary permissions.

3. **Performance Problems**: Use the built-in performance monitoring to identify bottlenecks.

## Maintenance

### 1. Updates

1. Pull the latest code from the repository
2. Install dependencies: `pnpm install`
3. Build for production: `pnpm run build`
4. Deploy the updated build

### 2. Rollback Procedure

If issues occur after deployment:

1. Identify the last stable version
2. Check out that version in your repository
3. Rebuild and redeploy