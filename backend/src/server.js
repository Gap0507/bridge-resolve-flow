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

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
  }
});

// Create default admin user on startup
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
    console.log('📧 Email: admin@resolveit.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error setting up default admin:', error.message);
  }
}

// Connect to database
connectDB().then(() => {
  // Create default admin after database connection
  createDefaultAdmin();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve uploaded files with custom middleware
app.use(serveUploads);

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ResolveIt API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-case', (caseId) => {
    socket.join(`case-${caseId}`);
    console.log(`User ${socket.id} joined case ${caseId}`);
  });
  
  socket.on('leave-case', (caseId) => {
    socket.leave(`case-${caseId}`);
    console.log(`User ${socket.id} left case ${caseId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ResolveIt API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

export { io }; 