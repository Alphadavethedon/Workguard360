# WorkGuard360 Backend

🚀 **Enterprise Workplace Security & Compliance Backend** - Production-ready Node.js backend for the WorkGuard360 platform.

## 🏆 Features

- **JWT Authentication** with role-based access control
- **Real-time Alerts** via Socket.IO
- **PDF/CSV Report Generation** with streaming
- **MongoDB Integration** with Mongoose ODM
- **OpenAPI Documentation** at `/api/docs`
- **Health Checks** for monitoring
- **Rate Limiting** and security middleware
- **TypeScript** for type safety

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- npm 10+

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd workguard360-backend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Seed admin user**
   ```bash
   npm run seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🌍 Environment Variables

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://workguard360.vercel.app
MONGO_URI=mongodb+srv://...
JWT_SECRET=yourSuperSecretKey
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/download` - Download report

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Health
- `GET /api/healthz` - Health check
- `GET /api/readyz` - Readiness check
- `GET /api/version` - Version info

## 🧪 Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🚀 Deployment

### Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Docker
```bash
docker build -t workguard360-backend .
docker run -p 5000:5000 --env-file .env workguard360-backend
```

## 🔧 Development

### Scripts
- `npm run dev` - Development with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm run seed` - Seed admin user

### Project Structure
```
src/
├── app.ts              # Express app configuration
├── server.ts           # HTTP server + Socket.IO
├── config/             # Configuration modules
├── db/                 # Database connection
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── controllers/        # Route controllers
├── services/           # Business logic
├── utils/              # Utility functions
├── sockets/            # Socket.IO handlers
├── docs/               # OpenAPI documentation
└── seeds/              # Database seeds
```

## 🔐 Security

- JWT tokens with HS256 signing
- bcrypt password hashing (12 rounds)
- Rate limiting (100 requests/15min)
- CORS with strict origin checking
- Helmet.js security headers
- Input validation with Zod

## 📊 Monitoring

- Health checks at `/api/healthz` and `/api/readyz`
- Structured logging with Pino
- Request logging with Morgan
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for enterprise workplace security**