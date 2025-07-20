1. I would like to run this app for the first time to test its functionality.  I have placed all of the latest july 2025 (our current month) convex docs in the doc-convex-latest-july2025 folder.  We have the convex mcp server set up (check the .kiro/settings mcp.json) which you can test to make sure it works if possible and I believe that we need to run the convex cli to be able to interact, populate etcetera our convex prooject. 

2.  I am not sure if it is wiser to run the app self-hosted which I would like to test for sure or to run it using the convex cloud and I need your best advice. 

2.  convex-auth. We need to make sure that convex auth (we are using the convex auth which is in Beta and works great in other apps) is set up properly and the docs to check this are in the doc-convex-latest-july2025 folder also. 

3. convex-functions. There are two images in the doc-convex-latest-july2025 folder that show my convex dashboard development functions section that is currently unpopulated.  

# Development environment variables
# Deployment used by `npx convex dev`

CONVEX_DEPLOYMENT=dev:gallant-mule-704 # team: gregory-kennedy, project: ea-policy-frame-app-d4188

VITE_CONVEX_URL=https://gallant-mule-704.convex.cloud

# Production environment variables
# Replace these values with actual production values before deployment

# Convex deployment for production
CONVEX_DEPLOYMENT=prod:your-production-deployment-id

# Convex URL for production
VITE_CONVEX_URL=https://your-production-deployment-id.convex.cloud

# API configuration
VITE_API_URL=https://api.policyframe.app
VITE_API_TIMEOUT=30000

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Security settings
VITE_CONTENT_SECURITY_POLICY=true

# Performance monitoring
VITE_PERFORMANCE_MONITORING=true

4.  Please provide the best advice on how to run this app for the first time based on what I have outlined above and then provide the step by step plan / task list to do so.