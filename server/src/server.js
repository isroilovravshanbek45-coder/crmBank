/**
 * Bank CRM API Server — PostgreSQL
 * Production-Ready Express Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Internal imports
import connectDB from './config/database.js';
import { pool } from './config/database.js';
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
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Create Express app
const app = express();

// ===== TRUST PROXY =====
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

// Cookie parser
app.use(cookieParser());

// Prevent parameter pollution
app.use(hpp());

// ===== BODY PARSER MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== COMPRESSION MIDDLEWARE =====
app.use(compression());

// ===== LOGGING MIDDLEWARE =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: logger.stream
    })
  );
}

// ===== API ROUTES =====
const API_VERSION = '/api/v1';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/clients`, clientRoutes);
app.use(`${API_VERSION}/operators`, operatorRoutes);

// Backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/operators', operatorRoutes);

// ===== HEALTH CHECK =====
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Bank CRM API is running',
      timestamp: new Date().toISOString(),
      database: { status: 'connected', time: result.rows[0].now },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ROOT =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bank CRM API v2.0 (PostgreSQL)',
    version: '2.0.0'
  });
});

// ===== ERROR HANDLERS =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 Bank CRM API Server Started (PostgreSQL)');
      logger.info('='.repeat(50));
      logger.info(`📡 Server: http://${HOST}:${PORT}`);
      logger.info(`🏥 Health: http://${HOST}:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🐘 Database: PostgreSQL`);
      logger.info('='.repeat(50));
    });

    // Graceful Shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`\n${signal} signal received: shutting down...`);
      server.close(async () => {
        await pool.end();
        logger.info('PostgreSQL pool closed. Goodbye!');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION!', err);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

startServer();

export default app;
