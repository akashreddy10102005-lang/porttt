require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database Connected Successfully!'))
    .catch((err) => console.log('❌ Database Connection Failed:', err));

// Schema & Model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Route
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        console.log("✅ Message saved to MongoDB!");
        return res.status(200).json({ success: true, message: "Message saved successfully!" });
    } catch (error) {
        console.error("❌ Server Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});