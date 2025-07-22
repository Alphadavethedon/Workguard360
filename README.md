
---

# 🚨 WorkGuard360

**Smart Workplace Security & Compliance System**
*Empowering enterprises with intelligent access monitoring, shift enforcement, and real-time compliance alerts.*

[🔴 Live Demo](https://workguard360.vercel.app/) • [📦 GitHub Repository](https://github.com/Alphadavethedon/Workguard360) • [👤 Author Portfolio](https://davisportfolio.vercel.app)

---

## 📌 Overview

**WorkGuard360** is a production-ready, full-stack enterprise platform built with the **MERN stack**, delivering secure, real-time employee access monitoring, role-based compliance enforcement, and auto-generated audit trails. Designed with scale and adaptability in mind, it is purpose-built for high-security environments across Africa and beyond.

> 🌍 *Built in Nairobi. Engineered to scale across Africa.*

---

<img width="1349" height="623" alt="image" src="https://github.com/user-attachments/assets/e95389e5-09f8-4eba-9778-8c8f2b73bf99" />

## 🧠 Key Highlights

### 🔐 Role-Based Authentication & Access Control

* Secure JWT login
* Protected routes with dynamic UI
* Role-specific dashboards: **Admin**, **HR**, **Security**

### 📊 Real-Time Monitoring & Violation Detection

* Live access log stream (interval or bulk)
* Auto-detection of:

  * 🚫 Unauthorized floor access
  * ⏰ Shift timing violations
* Violation feed with timestamps and alert triggers

### 🏢 Shift, Floor & Access Management

* Create/manage shifts, employees, and floor access
* Assign floors to roles
* View compliance heatmaps

### 🔔 Alert Center & Workflow

* Auto-alert generation on violations
* Archive, resolve, or escalate alerts
* Filter by role, status, or time

### 📄 Advanced Reporting & Audit Logs

* Weekly PDF & CSV reports (via PDFKit, json2csv)
* Export logs by date, role, or floor
* Comprehensive audit log system

### 🎨 UI/UX Excellence

* Built with **Tailwind CSS** + **Framer Motion**
* Glassmorphism design
* Dark/light mode toggle
* Fully responsive (desktop, tablet, mobile)

---

## 🚀 Demo Credentials

| Role     | Email                                                         | Password    |
| -------- | ------------------------------------------------------------- | ----------- |
| Admin    | [admin@workguard360.com](mailto:admin@workguard360.com)       | admin123    |
| HR       | [hr@workguard360.com](mailto:hr@workguard360.com)             | hr123       |
| Security | [security@workguard360.com](mailto:security@workguard360.com) | security123 |

---

## 🧱 Tech Stack

| Layer         | Technologies                                |
| ------------- | ------------------------------------------- |
| **Frontend**  | React, Vite, Tailwind CSS, Framer Motion    |
| **Backend**   | Node.js, Express.js, MongoDB, Mongoose, JWT |
| **Dev Tools** | React Query, Axios, Zod, React Hook Form    |
| **Reporting** | PDFKit, json2csv                            |
| **Testing**   | Jest, Supertest, React Testing Library      |
| **CI/CD**     | GitHub Actions                              |
| **Deploy**    | Vercel (frontend), Render (backend)         |

---

## 🛠 Developer Setup (Local)

```bash
# 1. Clone the repository
git clone https://github.com/Alphadavethedon/Workguard360.git
cd Workguard360

# 2. Install dependencies
cd client && npm install
cd ../server && npm install

# 3. Create .env files

# client/.env
VITE_API_URL=http://localhost:5000/api

# server/.env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key

# 4. Run the project

# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

---

## 🗂️ Project Structure

```
workguard360/
├── client/            # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
├── server/            # Express.js backend API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── services/
└── README.md
```

---

## 🧠 Developer Tips

* 🔄 Login with any role to simulate behavior
* 🧪 Use Admin panel to simulate logs and detect violations
* 📤 Export logs weekly in PDF/CSV
* 🔍 Intentionally breach rules to test alerts system
* 💡 Use filters to drill into compliance issues

---

## 🎯 Roadmap (2025–2026)

✅ MVP Complete
🧠 Upcoming:

* 🔐 Biometric SDK Integration (Facial, Fingerprint)
* 🌐 WebSocket log ingestion (real-time hardware sync)
* 📬 SMS/Email alerts via Twilio/SendGrid
* 📷 Integration: Hikvision, Suprema, ZKTeco
* 🏢 Multi-tenant mode (company-level separation)
* 📱 React Native / PWA mobile version
* 💰 Tiered pricing models (KES 100K–10M range)

---

## 📜 License

MIT License — free to use, customize, and distribute.

---

## 👨‍💻 About the Author

**Davis Wabwile**
Full-Stack Developer · Cloud & AI Engineer
📍 Nairobi, Kenya

📧 [daviswabwile@gmail.com](mailto:daviswabwile@gmail.com)

🌐 [davisportfolio.vercel.app](https://davisportfolio.vercel.app)

> Let’s connect for enterprise integrations, pilot programs, or developer partnerships.

---

## 🔗 Quick Links

* 🔴 [Live Demo](https://workguard360.vercel.app)
* 📦 [GitHub Repository](https://github.com/Alphadavethedon/Workguard360)
* 👤 [Portfolio](https://davisportfolio.vercel.app)

---

