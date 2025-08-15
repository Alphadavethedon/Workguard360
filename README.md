# WorkGuard360 Backend

🚀 **Enterprise Workplace Compliance & Security Backend** - A world-class, production-ready Node.js backend for the WorkGuard360 platform.

## 🏆 Features

### 🔐 **Authentication & Security**
- **JWT Authentication** with access & refresh tokens
- **Role-based Access Control (RBAC)** with granular permissions
- **Password Hashing** with bcrypt (12 salt rounds)
- **Account Lockout** protection against brute force attacks
- **Rate Limiting** to prevent abuse
- **Helmet.js** for HTTP security headers

### 📊 **Core Functionality**
- **User Management** - Complete CRUD operations with role assignment
- **Security Alerts** - Real-time alert system with severity levels
- **Access Logging** - Comprehensive access tracking and monitoring
- **Report Generation** - Automated report creation with multiple formats
- **Dashboard Analytics** - Real-time statistics and trends

### 🚀 **Performance & Scalability**
- **MongoDB Indexing** for optimized queries
- **Compression Middleware** for reduced payload sizes
- **Connection Pooling** with Mongoose
- **Async/Await** with proper error handling
- **Graceful Shutdown** handling

### 🔄 **Real-time Features**
- **Socket.IO Integration** for live updates
- **Real-time Alerts** broadcasting
- **Live Dashboard** updates
- **Activity Feed** streaming

### 📈 **Monitoring & Logging**
- **Winston Logger** with multiple transports
- **Morgan HTTP Logging** for request tracking
- **Health Check Endpoints** for monitoring
- **Error Tracking** with detailed stack traces
- **Performance Metrics** collection

## 🛠 **Tech Stack**

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Real-time**: Socket.IO
- **Logging**: Winston, Morgan
- **Validation**: express-validator
- **Testing**: Jest, Supertest

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workguard360-backend.git
   cd workguard360-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🌍 **Environment Variables**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URL
CLIENT_URL=https://workguard360.vercel.app

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

## 📚 **API Documentation**

### Authentication Endpoints
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login
POST   /api/auth/refresh      - Refresh access token
GET    /api/auth/me           - Get current user
POST   /api/auth/logout       - User logout
POST   /api/auth/forgot-password - Request password reset
```

### User Management
```
GET    /api/users             - Get all users (paginated)
GET    /api/users/:id         - Get user by ID
POST   /api/users             - Create new user
PUT    /api/users/:id         - Update user
DELETE /api/users/:id         - Deactivate user
POST   /api/users/:id/reset-password - Reset user password
```

### Security Alerts
```
GET    /api/alerts            - Get all alerts (filtered)
GET    /api/alerts/:id        - Get alert by ID
POST   /api/alerts            - Create new alert
PATCH  /api/alerts/:id/acknowledge - Acknowledge alert
PATCH  /api/alerts/:id/resolve - Resolve alert
PUT    /api/alerts/:id        - Update alert
DELETE /api/alerts/:id        - Delete alert
```

### Reports
```
GET    /api/reports           - Get all reports
GET    /api/reports/:id       - Get report by ID
POST   /api/reports/generate  - Generate new report
GET    /api/reports/:id/download - Download report
DELETE /api/reports/:id       - Delete report
```

### Dashboard
```
GET    /api/dashboard/stats           - Get dashboard statistics
GET    /api/dashboard/recent-activity - Get recent access activity
GET    /api/dashboard/alerts-summary  - Get alerts summary
GET    /api/dashboard/access-trends   - Get access trends
```

### Health Check
```
GET    /api/health            - Basic health check
GET    /api/health/detailed   - Detailed system health
```

## 🔐 **Security Features**

### Role-Based Access Control
- **Super Admin**: Full system access
- **Admin**: Administrative access with most permissions
- **Security Manager**: Security-focused access
- **HR Manager**: Human resources access
- **Employee**: Basic employee access

### Permission System
- Granular permissions for each resource and action
- Dynamic permission checking middleware
- Access level-based authorization

### Security Middleware
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Helmet.js for HTTP security headers
- Input validation and sanitization

## 📊 **Database Schema**

### Collections
- **users** - User accounts and profiles
- **roles** - User roles and permissions
- **permissions** - System permissions
- **alerts** - Security alerts and incidents
- **accesslogs** - Access tracking records
- **reports** - Generated reports

### Indexes
- Optimized indexes for frequently queried fields
- Compound indexes for complex queries
- Text indexes for search functionality

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 **Deployment**

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Docker Deployment
```bash
# Build image
docker build -t workguard360-backend .

# Run container
docker run -p 5000:5000 --env-file .env workguard360-backend
```

## 🔧 **Development**

### Project Structure
```
├── models/           # Mongoose models
├── routes/           # Express routes
├── middleware/       # Custom middleware
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── logs/            # Log files
├── tests/           # Test files
└── server.js        # Main server file
```

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Husky for pre-commit hooks

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- Create an issue on GitHub
- Email: support@workguard360.com
- Documentation: [docs.workguard360.com](https://docs.workguard360.com)

---

**Built with ❤️ for enterprise workplace security and compliance**

🏆 **Ready for hackathons, production, and global scale!**