const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Pejabat = require('../models/Pejabat');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lapas_p2u_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
const upload = multer({ storage: storage });

// Get all officials
router.get('/', async (req, res) => {
    try {
        const pejabatList = await Pejabat.find().sort({ created_at: -1 });
        res.json(pejabatList);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single official
router.get('/:id', async (req, res) => {
    try {
        const pejabat = await Pejabat.findById(req.params.id);
        if (!pejabat) return res.status(404).json({ message: 'Pejabat not found' });
        res.json(pejabat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new official
router.post('/', upload.single('foto_hp'), async (req, res) => {
    try {
        const { nama, nomor_hp, merk_hp, tipe_hp, imei } = req.body;
        
        // Generate custom ID "LAPAS-USER-XXXX"
        const count = await Pejabat.countDocuments();
        const custom_id = `LAPAS-USER-${String(count + 1).padStart(4, '0')}`;
        
        // Generate QR code for the custom_id
        const qrCodeDataUrl = await QRCode.toDataURL(custom_id);

        const newPejabat = new Pejabat({
            nama,
            nomor_hp,
            merk_hp,
            tipe_hp,
            imei,
            foto_hp: req.file ? req.file.path : null, // Path to the uploaded photo
            qr_code: qrCodeDataUrl,
            custom_id
        });

        const savedPejabat = await newPejabat.save();
        res.status(201).json(savedPejabat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an official
router.put('/:id', upload.single('foto_hp'), async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) {
            updates.foto_hp = req.file.path;
        }

        const updatedPejabat = await Pejabat.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedPejabat) return res.status(404).json({ message: 'Pejabat not found' });
        
        res.json(updatedPejabat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an official
router.delete('/:id', async (req, res) => {
    try {
        const deletedPejabat = await Pejabat.findByIdAndDelete(req.params.id);
        if (!deletedPejabat) return res.status(404).json({ message: 'Pejabat not found' });
        res.json({ message: 'Pejabat deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
