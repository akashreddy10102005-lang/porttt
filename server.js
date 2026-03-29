require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB కి కనెక్ట్ అవ్వడం
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connected Successfully!'))
  .catch((err) => console.log('Database Connection Failed:', err));
  // --- Step 4: Schema & Model ---
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);
// ------------------------------

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

// Middleware
app.use(cors()); // Allow requests from frontend 
// Serve static files (Your HTML/CSS/JS)
// Make sure your HTML file is inside a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ================= EMAIL TRANSPORTER CONFIGURATION =================
const transporter = nodemailer.createTransport({
  service: 'gmail', // ఇలా మార్చండి
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= API ROUTE: CONTACT FORM =================
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic Validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }
    // --- Step 5: Save to Database ---
try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log("✅ Data saved to MongoDB!");
} catch (dbError) {
    console.error("❌ Database Save Error:", dbError);
    // డేటాబేస్ సేవ్ అవ్వకపోయినా ఈమెయిల్ వెళ్లాలనుకుంటే ఇక్కడితో ఆపేయవచ్చు
    // లేదా రిటర్న్ ఎర్రర్ పంపవచ్చు.
}
// ------------------------------

    // Email Content
    const mailOptions = {
        from: process.env.EMAIL_USER, // Your email
        to: process.env.EMAIL_USER,   // Send to yourself (or a business email)
        subject: `Portfolio Contact: New message from ${name}`,
        html: `
            <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif;">
                <h2 style="color: #00d4ff;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <hr style="border-top: 1px solid #eee;">
                <h3>Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        `,
        replyTo: email // Allows you to reply directly to the sender
    };

    try {
        // Send Email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent from ${email}`);
        
        res.status(200).json({ 
            success: true, 
            message: "Message sent successfully! I will get back to you soon." 
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error. Could not send message." 
        });
    }
});

// ================= START SERVER =================
app.listen(9000, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});