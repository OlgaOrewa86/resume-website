const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const validator = require("validator");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const app = express();

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

// Handle root request ("/")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const predefinedSubject = "Inquiry from Website"; // fixed part

// Rate limiter prevents excessive email requests (max 5 per 15 min window)
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏳ 15 minutes
  max: 5, // Limit: 5 requests per windowMs
  message: { error: "Too many emails sent. Try again later." },
});

// Handle form submission
app.post("/send-email", emailLimiter, async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  //Server-side validation
  //Validate email format before processing
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validator.isAlphanumeric(fullName.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Name contains invalid characters" });
  }

  if (!validator.isMobilePhone(phone, "any")) {
    // Accepts numbers from all regions
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (!phone || !message || !subject) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Configure NodeMailer transport
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.me.com",
    port: 465, // Use 587 STARTTLS (or 465 for SSL)
    secure: true, // Must be false for STARTTLS (true for SSL)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: `${predefinedSubject} - ${subject}`,
    text: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  // Attempt to send email, catch failures due to SMTP or credential issues
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
