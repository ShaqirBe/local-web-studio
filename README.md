Local Web Studio – Portfolio Website

Local Web Studio is a clean, modern web portfolio and business website built to showcase web development services. The project demonstrates both frontend and backend skills, including responsive design, interactive UI, and server-side email handling. It features a premium, user-friendly interface with smooth animations, a responsive layout for desktop and mobile, and an AJAX-powered contact form that submits inquiries without page reload. The backend is built with Node.js and Express.js using Nodemailer for secure email delivery, with all sensitive credentials stored in environment variables for safety. The structure is modular and easily extendable, allowing the addition of new pages, services, or languages. This project highlights the ability to develop full-stack applications, implement secure communication features, and create professional, business-ready web experiences.

Features

    •	Modern, premium UI with smooth animations
    •	Responsive layout for desktop and mobile
    •	AJAX contact form with server-side email handling
    •	Node.js backend with Nodemailer and environment-based credentials
    •	Easy to extend and maintain

Technology Stack

    •	Frontend: HTML, CSS, JavaScript
    •	Backend: Node.js, Express.js, Nodemailer
    •	Environment Management: .env for secure credentials
    •	Version Control: Git

Project Structure

local-web-studio/
│
├─ public/ # Frontend files (HTML, CSS, JS)
├─ server.js # Node.js backend
├─ package.json # Node dependencies
└─ .env # Environment variables (not committed)

Getting Started

    1.	Clone the repository: git clone <repo-url> && cd local-web-studio
    2.	Install dependencies: npm install
    3.	Create your local .env from the template:
       cp .env.example .env
    4.	Fill .env with your Gmail credentials:

PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

    5.	Start the server: node server.js
    6.	Open in your browser at http://localhost:3000

Gmail Setup

    • Use a Gmail App Password (not your normal Gmail password)
    • Turn on 2-Step Verification on your Google account
    • Generate App Password in Google Account -> Security -> App passwords

Production / Hosting

Do not upload .env to GitHub. In production, set the same keys directly in your hosting provider's Environment Variables settings:

    • PORT
    • EMAIL_USER
    • EMAIL_PASSWORD

Notes

All sensitive information is stored in environment variables and excluded from Git. The contact form uses AJAX for a smooth, modern user experience.

Hello from the team!
