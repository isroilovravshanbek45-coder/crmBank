/**
 * Bank CRM API Server
 * Production-Ready Express Server with Security & Performance Optimizations
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Internal imports
import connectDB from './config/database.js';
import logger from './config/logger.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import operatorRoutes from './routes/operatorRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Create Express app
const app = express();

// ===== TRUST PROXY =====
// Production'da reverse proxy (Nginx, Vercel, etc.) uchun
app.set('trust proxy', 1);

// ===== SECURITY MIDDLEWARE =====

// Helmet - HTTP headers security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173'];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS (Cross Site Scripting)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// ===== BODY PARSER MIDDLEWARE =====

// Parse JSON bodies (limit: 10mb)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== COMPRESSION MIDDLEWARE =====

// Gzip compression for responses
app.use(compression());

// ===== LOGGING MIDDLEWARE =====

// Morgan HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: log to file
  app.use(
    morgan('combined', {
      stream: logger.stream
    })
  );
}

// Custom request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user?.operatorId || req.user?.username || 'anonymous'
  });
  next();
});

// ===== DATABASE CONNECTION =====

connectDB();

// ===== API ROUTES =====

// API version prefix
const API_VERSION = '/api/v1';

// Mount routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/clients`, clientRoutes);
app.use(`${API_VERSION}/operators`, operatorRoutes);

// Backward compatibility - redirect old routes to new version
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/operators', operatorRoutes);

// ===== HEALTH CHECK ENDPOINT =====

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // Uptime
    const uptime = process.uptime();

    res.json({
      success: true,
      message: 'Bank CRM API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      server: {
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
        },
        nodejs: process.version,
        pid: process.pid
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ROOT ENDPOINT =====

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bank CRM API',
    version: '2.0.0',
    documentation: {
      endpoints: {
        auth: `${API_VERSION}/auth`,
        clients: `${API_VERSION}/clients`,
        operators: `${API_VERSION}/operators`,
        health: '/health'
      },
      features: [
        'JWT Authentication',
        'Role-based Access Control',
        'Rate Limiting',
        'Request Validation',
        'Pagination & Filtering',
        'Search Functionality',
        'Soft Delete',
        'Performance Optimizations',
        'Security Hardening',
        'Professional Logging'
      ]
    }
  });
});

// ===== ERROR HANDLERS =====

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ===== SERVER STARTUP =====

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info('='.repeat(50));
  logger.info('🚀 Bank CRM API Server Started');
  logger.info('='.repeat(50));
  logger.info(`📡 Server: http://${HOST}:${PORT}`);
  logger.info(`🏥 Health: http://${HOST}:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📦 Node Version: ${process.version}`);
  logger.info(`🔐 Security: Enabled (Helmet, CORS, XSS, NoSQL Injection)`);
  logger.info(`⚡ Performance: Enabled (Compression, Caching)`);
  logger.info(`📝 Logging: Winston + Morgan`);
  logger.info('='.repeat(50));
});

// ===== GRACEFUL SHUTDOWN =====

const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} signal received: closing HTTP server gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after 10 seconds...');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export default app;
