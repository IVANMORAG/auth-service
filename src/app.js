const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const passport = require('./config/passport');

const app = express();

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================================
app.use(helmet());

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3005'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});
app.use(limiter);

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// ============================================================================
// RUTAS
// ============================================================================
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Auth Service API',
        version: '1.0.0',
        status: 'Running'
    });
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================
app.use(errorHandler);

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl
    });
});

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================
// Railway proporciona el puerto dinámicamente
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await connectDB();
        console.log('✅ Base de datos conectada');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Auth Service ejecutándose en puerto ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de señales para cierre limpio
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

startServer();