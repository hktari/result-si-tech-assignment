import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    // Given - Set up test application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.activity.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      // Given - Valid registration data
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // When - Making registration request
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      // Then - Should return user data without password
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(registerData.name);
      expect(response.body.email).toBe(registerData.email);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 409 when email already exists', async () => {
      // Given - Existing user
      const existingUser = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10),
      };
      await prismaService.user.create({ data: existingUser });

      const registerData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password456',
      };

      // When - Attempting to register with existing email
      // Then - Should return conflict error
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Given - Create test user for login tests
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prismaService.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      // Given - Valid login credentials
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // When - Making login request
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      // Then - Should return access token and user data
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid credentials', async () => {
      // Given - Invalid login credentials
      const invalidLoginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // When - Making login request with invalid credentials
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      // Given - Non-existent user credentials
      const nonExistentUserData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // When - Making login request for non-existent user
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(nonExistentUserData)
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Given - Create test user and get access token
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prismaService.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should return user profile when authenticated', async () => {
      // When - Making profile request with valid token
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return user profile
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making profile request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      // When - Making profile request with invalid token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
