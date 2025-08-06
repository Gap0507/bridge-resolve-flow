import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { serveUploads } from './utils/fileUpload.js';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import caseRoutes from './routes/cases.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Initialize app and server
const app = express();
const server = createServer(app);

// CORS setup (apply FIRST)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

// Support multiple origins for development and production
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:8080",
  "https://bridge-resolve-flow.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions
});

// Connect DB and setup default admin
connectDB().then(createDefaultAdmin);

// Create default admin user
async function createDefaultAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.findOneAndUpdate(
      { email: 'admin@resolveit.com' },
      {
        name: 'System Administrator',
        email: 'admin@resolveit.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+15550000000',
        age: 30,
        gender: 'prefer-not-to-say',
        address: {
          street: 'System Address',
          city: 'System City',
          zipCode: '00000',
          state: 'System State'
        },
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Default admin user ready');
  } catch (error) {
    console.error('❌ Error setting up default admin:', error.message);
  }
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// File upload serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(serveUploads);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ResolveIt API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-case', (caseId) => {
    socket.join(`case-${caseId}`);
    console.log(`🧑‍⚖️ ${socket.id} joined case ${caseId}`);
  });

  socket.on('leave-case', (caseId) => {
    socket.leave(`case-${caseId}`);
    console.log(`👋 ${socket.id} left case ${caseId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
});

export { io };
