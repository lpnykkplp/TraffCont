const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'traffcont_super_secret_key_123';

// @route   GET /api/auth/create-p2u
// @desc    Temporary route to inject P2U user
router.get('/create-p2u', async (req, res) => {
    try {
        const existingP2U = await User.findOne({ username: 'p2u' });
        if (existingP2U) {
            return res.json({ message: 'User P2U sudah ada di database.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('p2uLPNYK', salt);

        const p2u = new User({
            username: 'p2u',
            password: hashedPassword,
            nama: 'Petugas P2U',
            role: 'Petugas'
        });

        await p2u.save();
        res.json({ message: 'User P2U berhasil dibuat dengan sandi p2uLPNYK' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Auto-seed if database is completely empty
        const totalUsers = await User.countDocuments();
        if (totalUsers === 0) {
            console.log("No users found. Seeding default admin user.");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            const adminUser = new User({
                username: 'admin',
                password: hashedPassword,
                nama: 'Administrator',
                role: 'Admin'
            });
            await adminUser.save();
        }

        // Check user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Username tidak ditemukan' });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password salah' });
        }

        // Sign token
        const payload = {
            id: user.id,
            username: user.username,
            nama: user.nama,
            role: user.role
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '12h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: payload
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
