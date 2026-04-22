const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const existingP2U = await User.findOne({ username: 'p2u' });
        if (existingP2U) {
            console.log('P2U user already exists! Deleting and re-creating to ensure password is correct.');
            await User.deleteOne({ username: 'p2u' });
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
        console.log('P2U User seeded successfully!');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

seed();
