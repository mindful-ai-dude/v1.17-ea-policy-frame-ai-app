# Step-by-Step Task List to Run and Test Your Convex App

## 1. Start the Convex MCP Server
```bash
npx convex mcp start
```
This will start the Convex Model Context Protocol server that's configured in your `.kiro/settings/mcp.json`.

## 2. Update Environment Variables
```bash
# Add your Google API key to .env.local if you have one
echo "GEMINI_API_KEY=your_google_api_key_here" >> .env.local
```
Note: If you don't have a Google API key yet, you can proceed without it and add it later.

## 3. Initialize and Deploy Convex Functions
```bash
# Initialize Convex project
pnpm run init:convex

# Deploy your Convex functions to the cloud deployment
npx convex deploy
```
This will deploy your functions to the Convex cloud deployment specified in your `.env.local` file.

## 4. Verify Functions in Dashboard
```bash
# Open the Convex dashboard to verify functions are deployed
npx convex dashboard
```
Check that your functions appear in the dashboard. You should see functions from:
- `convex/auth.ts`
- `convex/content.ts`
- `convex/documents.ts`
- `convex/files.ts`
- `convex/users.ts`

## 5. Populate Initial Data
```bash
# Create initial user data
npx convex run auth:storeUser
```
This will run the `storeUser` mutation from your `auth.ts` file to create an initial user record. You'll need to be authenticated for this to work, so it may be better to do this after starting the app.

## 6. Start the Development Server
```bash
# Start all services (frontend, backend, and Convex)
pnpm run dev
```
This runs your frontend (Vite), backend (Node.js), and Convex development server concurrently.

## 7. Test Authentication
1. Open your app in the browser (likely at http://localhost:5173)
2. Try signing in with Google or GitHub
3. Check the Convex dashboard to verify user creation in the database

Note: The OAuth providers (Google and GitHub) should work without additional setup if they're already configured in your Convex dashboard. If not, you'll need to set them up there.

## 8. Test App Features
1. Test content generation features
2. Test document upload and processing
3. Test any other core functionality

## 9. Test Self-Hosting with Docker (Optional)
```bash
# Download the docker-compose.yml file
curl -O https://raw.githubusercontent.com/get-convex/convex-backend/main/self-hosted/docker/docker-compose.yml

# Start the Convex backend and dashboard with Docker
docker compose up -d

# Generate an admin key for the dashboard/CLI
docker compose exec backend ./generate_admin_key.sh
```

## 10. Configure App for Self-Hosted Backend (Optional)
```bash
# Create a new .env.local.self-hosted file
echo "CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'" > .env.local.self-hosted
echo "CONVEX_SELF_HOSTED_ADMIN_KEY='<your admin key>'" >> .env.local.self-hosted
```

## 11. Deploy to Self-Hosted Backend (Optional)
```bash
# Use the self-hosted environment variables
cp .env.local.self-hosted .env.local

# Deploy to self-hosted backend
npx convex deploy
```

## 12. Test App with Self-Hosted Backend (Optional)
```bash
# Start the development server with self-hosted backend
pnpm run dev
```
Test the same features as before to ensure they work with the self-hosted backend.

## 13. Return to Cloud Deployment (Optional)
```bash
# Restore original .env.local if you want to go back to cloud deployment
git checkout -- .env.local
```