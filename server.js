const express = require('express');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https://image.thum.io; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const rateLimitWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestStore = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}

function sendRateLimit(req, res, next) {
  const now = Date.now();
  const clientIp = getClientIp(req);
  const timestamps = requestStore.get(clientIp) || [];
  const recent = timestamps.filter((timestamp) => now - timestamp < rateLimitWindowMs);

  if (recent.length >= maxRequestsPerWindow) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  recent.push(now);
  requestStore.set(clientIp, recent);
  return next();
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
  if (!url) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/send', sendRateLimit, async (req, res) => {
  const business = normalizeString(req.body.business);
  const email = normalizeString(req.body.email).toLowerCase();
  const website = normalizeString(req.body.website);
  const message = normalizeString(req.body.message);
  const company = normalizeString(req.body.company);

  if (company) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  if (!business || !email || !message) {
    return res.status(400).json({ error: 'Business, email, and message are required.' });
  }

  if (business.length > 100 || email.length > 254 || website.length > 200 || message.length > 2000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!isValidUrl(website)) {
    return res.status(400).json({ error: 'Please provide a valid website URL.' });
  }

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('Missing EMAIL_USER or EMAIL_PASS environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const safeBusiness = escapeHtml(business);
  const safeEmail = escapeHtml(email);
  const safeWebsite = website ? escapeHtml(website) : 'N/A';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const mailOptions = {
    from: `"Local Web Studio Contact" <${EMAIL_USER}>`,
    replyTo: email,
    to: EMAIL_USER,
    subject: `New Contact Request from ${business}`,
    html: `<p><strong>Business:</strong> ${safeBusiness}</p>
           <p><strong>Email:</strong> ${safeEmail}</p>
           <p><strong>Website:</strong> ${safeWebsite}</p>
           <p><strong>Message:</strong><br>${safeMessage}</p>`,
    text: `Business: ${business}\nEmail: ${email}\nWebsite: ${website || 'N/A'}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Error sending email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
