const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config(); 

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (your website)
app.use(express.static('public')); 


 // Nodemailer transporter
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // POST route
app.post('/send', async (req, res) => {
    const { business, email, website, message } = req.body;
  
    const mailOptions = {
      from: `"${business}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Request from ${business}`,
      html: `<p><strong>Business:</strong> ${business}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Website:</strong> ${website || 'N/A'}</p>
             <p><strong>Message:</strong><br>${message}</p>`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.send('Message sent successfully!');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error sending email');
    }
  });

  // Catch-all route for SPA routing (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));