# Convex Backend

This directory contains the Convex backend for the EA PolicyFrame App.

## Structure

- `schema.ts`: Defines the database schema for the application
- `auth.ts`: Authentication-related functions
- `content.ts`: Functions for managing generated content
- `documents.ts`: Functions for managing documents
- `files.ts`: Functions for file storage and processing
- `users.ts`: Functions for user management
- `auth.config.js`: Configuration for Convex authentication

## Getting Started

1. Install the Convex CLI:
   ```bash
   pnpm add -g convex
   ```

2. Initialize Convex:
   ```bash
   npx convex dev
   ```

3. Deploy to production:
   ```bash
   npx convex deploy
   ```

## Authentication

The application uses Convex Auth for authentication. You can configure authentication providers in `auth.config.js`.

## Database Schema

The database schema is defined in `schema.ts` and includes the following tables:

- `users`: User accounts and preferences
- `generatedContent`: Content generated by the application
- `documents`: Documents uploaded by users

## API

The API is organized into several modules:

- `auth`: Authentication and user session management
- `content`: Content generation and management
- `documents`: Document management
- `files`: File storage and processing
- `users`: User management

## Development

During development, run the Convex development server:

```bash
npx convex dev
```

This will start a local development server and sync your local changes with your development Convex deployment.