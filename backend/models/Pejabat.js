const mongoose = require('mongoose');

const pejabatSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    jabatan: { type: String, default: '' },
    nomor_hp: { type: String, required: true },
    merk_hp: { type: String, required: true },
    tipe_hp: { type: String, required: true },
    imei: { type: String, required: true },
    foto_hp: { type: String }, // Can be a path or a base64 string
    qr_code: { type: String }, // The generated QR code base64 string
    custom_id: { type: String, unique: true }, // LAPAS-USER-XXXX
    status: { type: String, enum: ['dalam', 'luar'], default: 'luar' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pejabat', pejabatSchema);
