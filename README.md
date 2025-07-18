
 🚨 WorkGuard360 – Smart Workplace Security & Compliance System 

**WorkGuard360** is a production-ready, full-stack workplace security and compliance monitoring system built with the **MERN stack**, modern UI/UX principles, and advanced violation detection logic. It’s designed to help companies monitor employee access logs, detect floor-level breaches, track shift violations, and ensure full workplace compliance.

> 🌍 Built in Nairobi. Designed for the enterprise. Ready to scale across Africa and beyond.

---

📎 **[Click here to download WorkGuard360 Pitch Deck (PPTX)](sandbox:/mnt/data/WorkGuard360-PitchDeck.pptx)**
## 🌟 Demo Access (MVP)

| Role     | Email                          | Password   |
|----------|--------------------------------|------------|
| Admin    | `admin@workguard360.com`       | `admin123` |
| HR       | `hr@workguard360.com`          | `hr123`    |
| Security | `security@workguard360.com`    | `security123` |

---

## 🚀 Live (MVP)
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000/api](http://localhost:5000/api) (locally or via proxy)
- 💡 Sample data is pre-seeded for demo and testing.

---

## 🧱 Tech Stack

| Layer      | Technology                                |
|------------|--------------------------------------------|
| Frontend   | React, Tailwind CSS, Framer Motion, Vite   |
| Backend    | Node.js, Express.js, MongoDB, JWT          |
| Dev Tools  | React Query, Axios, Zod, React Hook Form   |
| Reports    | PDFKit, json2csv for CSV generation        |
| Deployment | Vercel (frontend), Render/Railway (backend) |

---

## 🔐 Features & Modules

### ✅ Authentication & Roles
- JWT-based login
- Role-based Access Control (Admin, HR, Security)
- Protected routes & dynamic dashboard views

### 📊 Real-Time Monitoring
- Simulated log ingestion system (bulk or interval-based)
- Live access log feed with timestamps
- Violation detection:
  - 🚫 Floor access breaches
  - ⏰ Shift compliance violations

### 📅 Shift & Access Management
- Create/manage shifts & access zones (floors)
- Floor-to-user mapping
- Smart compliance heatmaps

### 🔔 Alerts System
- Auto-triggered alerts on violations
- Archive/clear resolved alerts
- Filterable alert dashboard (role-based)

### 📄 Reports
- Downloadable weekly reports (PDF & CSV)
- Filter by employee, floor, shift, or date
- Exportable audit logs

### 🎨 Design & UX
- Tailwind CSS + Framer Motion transitions
- Elegant dark mode support
- Responsive UI (Mobile & Desktop)
- Glassmorphic cards, intuitive UX for all roles

---

## 🛠️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/Alphadavethedon/Workguard360.git && cd workguard360

# 2. Install both frontend & backend dependencies
cd client && npm install
cd ../server && npm install

# 3. Create environment files
# client/.env
VITE_API_URL=http://localhost:5000/api

# server/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# 4. Run the application
# Backend
cd server && npm run dev

# Frontend
cd ../client && npm run dev
````

---

## 📦 Folder Structure

```plaintext
workguard360/
│
├── client/             # React frontend
│   ├── src/components/
│   ├── src/pages/
│   ├── src/hooks/
│   ├── src/utils/
│   ├── App.tsx
│
├── server/             # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── index.js
```

---

## 🧪 Developer Tips

* 🌍 Switch roles easily using the demo logins
* 🛠 Create users, assign shifts, simulate logs in Admin panel
* 🔍 Use filters to search logs by employee/floor/date
* 📁 Test report downloads from Reports section
* 🧠 Check auto-generated alerts after violating shifts or floor access

---

## 📈 Roadmap

* 🔐 Biometric SDK integration (Facial/Fingerprint)
* 🛰️ WebSocket for real-time log streaming
* 📧 Email alerts (SendGrid)
* 🧩 Integration with Hikvision and access control systems
* 💰 Pilot monetization (KES 3K – 10K tiers)
* 🌐 Multi-tenancy & team access

---

## 📄 License

MIT License

---

## ✨ Created by

**Davis Wabwile**
Full-Stack Developer · Cloud Engineer · AI/ML Practitioner
🌍 [davisportfolio.vercel.app](https://davisportfolio.vercel.app/)
📧 [daviswabwile@gmail.com](mailto:daviswabwile@gmail.com)

> For demo, licensing, or onboarding: Reach out via email or LinkedIn.


```
