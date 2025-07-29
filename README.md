# Workguard360 Backend

Enterprise-grade workplace safety and security management backend system.

## Features

- 🔐 Advanced JWT Authentication with Role-Based Access Control
- 📊 Real-time Incident Reporting and Tracking
- 🛡️ Safety Compliance Monitoring
- 🚨 Emergency Response Management
- 📚 Training Module System
- 📄 Document Management
- 📈 Analytics and Reporting
- 🔔 Real-time Notifications
- 🌐 WebSocket Integration

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas Account
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd workguard360-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
CLIENT_URL=https://workguard360.vercel.app
JWT_SECRET=yourSuperSecretKey
MONGO_URI=your-mongodb-connection-string
NODE_ENV=production
PORT=5000
```

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents/:id` - Get single incident
- `PUT /api/incidents/:id` - Update incident

### Safety Compliance
- `GET /api/safety` - Get compliance items
- `POST /api/safety` - Create compliance item
- `PUT /api/safety/:id` - Update compliance

### Emergency
- `GET /api/emergency/contacts` - Emergency contacts
- `POST /api/emergency/report` - Report emergency
- `GET /api/emergency/procedures` - Emergency procedures

### Training
- `GET /api/training` - Get training modules
- `POST /api/training` - Create training
- `POST /api/training/:id/enroll` - Enroll in training

## Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```env
CLIENT_URL=https://workguard360.vercel.app
JWT_SECRET=yourSuperSecretKey
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NODE_ENV=production
PORT=5000
```

## Security Features

- JWT Authentication
- Rate Limiting
- CORS Protection
- Input Sanitization
- XSS Protection
- Helmet Security Headers
- MongoDB Injection Prevention

## Real-time Features

- Socket.IO integration
- Live incident updates
- Emergency alerts
- Notification system

## License

MIT License