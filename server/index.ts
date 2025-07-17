import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { rateLimit } from 'express-rate-limit';

// Load environment variables based on NODE_ENV
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Force HTTPS in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", ...(isProduction ? [] : ["'unsafe-eval'"])],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://storage.googleapis.com'],
      connectSrc: ["'self'", process.env.VITE_CONVEX_URL || ''],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: isProduction,
  crossOriginOpenerPolicy: isProduction,
  crossOriginResourcePolicy: isProduction ? { policy: 'same-origin' } : false,
  originAgentCluster: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: isProduction ? {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  } : false,
  xContentTypeOptions: true,
  xDnsPrefetchControl: true,
  xDownloadOptions: true,
  xFrameOptions: { action: 'deny' },
  xPermittedCrossDomainPolicies: true,
  xXssProtection: true,
}));

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? ['https://policyframe.app', 'https://www.policyframe.app'] 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Logging
app.use(morgan(isProduction ? 'combined' : 'dev', {
  skip: (_req, res) => isProduction && res.statusCode < 400
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});

// API routes will be added here

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
if (isProduction) {
  // In production, assume proper HTTPS is handled by the hosting platform
  app.listen(PORT, () => {
    console.log(`Production server running on port ${PORT}`);
  });
} else {
  // In development, use self-signed certificates for HTTPS
  try {
    const privateKey = fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, '../certs/localhost.pem'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, () => {
      console.log(`Development HTTPS server running on port ${PORT}`);
    });
  } catch (error) {
    console.warn('HTTPS certificates not found, falling back to HTTP (not recommended)');
    app.listen(PORT, () => {
      console.log(`Development HTTP server running on port ${PORT}`);
    });
  }
}

export default app;