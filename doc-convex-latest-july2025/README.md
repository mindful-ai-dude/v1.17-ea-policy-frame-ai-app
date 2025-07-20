# EA PolicyFrame App

A sophisticated web application that combines Effective Altruism principles with George Lakoff's cognitive framing methodology to generate strategically framed AI policy content.

![EA PolicyFrame App](https://via.placeholder.com/1200x630?text=EA+PolicyFrame+App)

## Features

- Generate strategically framed AI policy content using proven cognitive framing techniques
- Choose from multiple AI models (gemini-2.5-pro, gemini-2.5-flash, gemma-3-12b-it)
- Create four distinct content types: blog posts, policy articles, marketing playbooks, and social media calendars
- Adapt content to specific regional contexts (USA, Europe, Australia, Morocco)
- Reference stored documents and extract relevant examples
- Secure API key management and usage monitoring
- Modern glassmorphic design system
- Progressive Web App (PWA) support for offline capabilities
- Performance monitoring and optimization

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 3.4+, Zustand 4.5+, React Router 6.24+
- **Backend:** Express.js 4.19+, Convex 1.13+ (database, authentication, file storage)
- **External APIs:** Google Gemini API
- **Performance:** Web Vitals monitoring, lazy loading, code splitting
- **Security:** HTTPS enforcement, Content Security Policy, API key encryption

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or yarn 1.22+
- Google Gemini API key (for content generation)
- Convex account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ea-policy-frame-app.git
   cd ea-policy-frame-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate development certificates for HTTPS:
   ```bash
   npm run generate-certs
   ```

4. Create a `.env.local` file with your development configuration:
   ```
   # Convex deployment for development
   CONVEX_DEPLOYMENT=dev:your-development-deployment-id
   VITE_CONVEX_URL=https://your-development-deployment-id.convex.cloud
   
   # API configuration
   VITE_API_URL=https://localhost:3001
   VITE_API_TIMEOUT=30000
   
   # Feature flags
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_ERROR_REPORTING=false
   
   # Performance monitoring
   VITE_PERFORMANCE_MONITORING=true
   ```

5. Initialize Convex:
   ```bash
   npx convex dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The application uses a comprehensive development setup with multiple services:

- **Frontend:** `npm run dev:frontend` - Starts the Vite development server
- **Backend:** `npm run dev:backend` - Starts the Express.js server with hot reloading
- **Convex:** `npm run dev:convex` - Starts the Convex development server
- **All services:** `npm run dev` - Starts all services concurrently

### Development Tools

- **Testing:** `npm run test` - Runs Vitest tests
- **Linting:** `npm run lint` - Runs ESLint
- **Type checking:** `tsc -b` - Runs TypeScript compiler in build mode

## Building for Production

1. Update `.env.production` with your production values:
   ```
   # Convex deployment for production
   CONVEX_DEPLOYMENT=prod:your-production-deployment-id
   VITE_CONVEX_URL=https://your-production-deployment-id.convex.cloud
   
   # API configuration
   VITE_API_URL=https://api.yourdomain.com
   VITE_API_TIMEOUT=30000
   
   # Feature flags
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_ERROR_REPORTING=true
   
   # Performance monitoring
   VITE_PERFORMANCE_MONITORING=true
   VITE_PERFORMANCE_ENDPOINT=https://metrics.yourdomain.com/collect
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Options

#### Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

#### Heroku (Full Stack)

```bash
heroku create
git push heroku main
```

#### Docker

```bash
docker build -t ea-policy-frame-app .
docker run -p 8080:8080 ea-policy-frame-app
```

## Architecture

The application follows a modern architecture with:

- **Component-based UI:** Reusable glassmorphic components
- **State management:** Zustand for global state
- **API integration:** Service layer pattern
- **Database:** Convex for real-time data synchronization
- **Authentication:** Convex Auth for secure user management
- **File storage:** Convex File Storage for document handling

## Performance Optimization

The application includes several performance optimizations:

- **Code splitting:** Dynamic imports for route-based code splitting
- **Lazy loading:** Components and images loaded on demand
- **Compression:** Gzip and Brotli compression for assets
- **Caching:** Service worker for offline support and caching
- **Performance monitoring:** Web Vitals tracking and custom metrics

## Security Features

- **HTTPS enforcement:** All traffic is redirected to HTTPS
- **Content Security Policy:** Strict CSP to prevent XSS attacks
- **API key encryption:** Secure storage of API keys
- **Rate limiting:** Protection against abuse
- **Input validation:** Comprehensive validation of all user inputs

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

[MIT](LICENSE)

## Acknowledgements

- [George Lakoff](https://en.wikipedia.org/wiki/George_Lakoff) for cognitive framing methodology
- [Effective Altruism](https://www.effectivealtruism.org/) for ethical principles
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Convex](https://www.convex.dev/) for backend infrastructure