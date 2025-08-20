import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { Role } from '../models/Role';

describe('Auth Endpoints', () => {
  let adminRole: any;

  beforeEach(async () => {
    adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator',
      permissions: [],
      accessLevel: 10,
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: adminRole._id,
        department: 'Engineering',
        jobTitle: 'Developer',
        badgeNumber: 'TEST-001',
        accessLevel: 5,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});