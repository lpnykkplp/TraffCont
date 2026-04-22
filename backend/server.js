const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    
    let mongoURI = process.env.MONGO_URI;
    
    // If no URI is provided, use an in-memory db (dev only)
    if (!mongoURI) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoURI = mongoServer.getUri();
        console.log('Using in-memory MongoDB database.');
    }

    try {
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Ensure DB is connected before handling any request (critical for serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// Routes
const pejabatRoutes = require('./routes/pejabat');
const scanRoutes = require('./routes/scan');
const dashboardRoutes = require('./routes/dashboard');
const tamuRoutes = require('./routes/tamu');
const laporanRoutes = require('./routes/laporan');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/pejabat', authMiddleware, pejabatRoutes);
app.use('/api/scan', authMiddleware, scanRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/tamu', authMiddleware, tamuRoutes);
app.use('/api/laporan', authMiddleware, laporanRoutes);

// Export app for Vercel serverless
module.exports = app;

// Only listen when run directly (not imported by Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
