const mongoose = require('mongoose');

const tamuSchema = new mongoose.Schema({
    nama_tamu: { type: String, required: true },
    jabatan: { type: String, default: '' },
    asal_instansi: { type: String, required: true },
    jenis_perangkat: { 
        type: String, 
        enum: ['HP', 'Laptop', 'Tablet', 'Flashdisk', 'Hardisk', 'Lainnya'], 
        required: true 
    },
    merk: { type: String, required: true },
    keterangan: { type: String, default: '' },
    status: { type: String, enum: ['dalam', 'luar'], default: 'luar' },
    waktu_masuk: { type: Date, default: null },
    waktu_keluar: { type: Date, default: null },
    petugas: { type: String, default: 'Petugas P2U' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tamu', tamuSchema);
