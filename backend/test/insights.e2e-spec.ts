import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('InsightsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

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
    // Given - Clean up database and create test user
    // Delete in correct order to handle foreign key constraints
    await prismaService.activity.deleteMany();
    await prismaService.user.deleteMany();
    
    // Wait a bit to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prismaService.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
    userId = user.id;

    // Get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.access_token;

    // Create test activities for insights
    await prismaService.activity.createMany({
      data: [
        {
          title: 'Reading',
          description: 'Reading technical books',
          duration: 60,
          timestamp: new Date('2025-07-15T10:00:00Z'),
          userId,
        },
        {
          title: 'Reading',
          description: 'Reading articles',
          duration: 30,
          timestamp: new Date('2025-07-15T14:00:00Z'),
          userId,
        },
        {
          title: 'Writing',
          description: 'Writing code',
          duration: 90,
          timestamp: new Date('2025-07-16T09:00:00Z'),
          userId,
        },
        {
          title: 'Running',
          description: 'Morning run',
          duration: 45,
          timestamp: new Date('2025-07-16T07:00:00Z'),
          userId,
        },
      ],
    });
  });

  describe('/insights?metric=timePerTitle (GET)', () => {
    it('should return time per title insights', async () => {
      // When - Making get insights request for timePerTitle
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitle&start=2025-07-15T00:00:00Z&end=2025-07-16T23:59:59Z')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return aggregated time per title
      expect(response.body).toHaveLength(3);
      
      const readingInsight = response.body.find(item => item.title === 'Reading');
      const writingInsight = response.body.find(item => item.title === 'Writing');
      const runningInsight = response.body.find(item => item.title === 'Running');

      expect(readingInsight.totalDuration).toBe(90); // 60 + 30
      expect(writingInsight.totalDuration).toBe(90);
      expect(runningInsight.totalDuration).toBe(45);
    });

    it('should return filtered insights with search', async () => {
      // When - Making get insights request with search filter
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitle&search=reading')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return only reading-related insights
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Reading');
      expect(response.body[0].totalDuration).toBe(90);
    });

    it('should use default date range when not provided', async () => {
      // When - Making get insights request without date range
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitle')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return insights for default 30-day range
      expect(response.body).toHaveLength(3);
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get insights request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/insights?metric=timePerTitle')
        .expect(401);
    });
  });

  describe('/insights?metric=timePerTitleStacked (GET)', () => {
    it('should return stacked time insights for daily interval', async () => {
      // When - Making get insights request for timePerTitleStacked with daily interval
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked&start=2025-07-15T00:00:00Z&end=2025-07-16T23:59:59Z&interval=daily')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return stacked data by date
      expect(response.body).toHaveLength(2);

      const day1 = response.body.find(item => item.date === '2025-07-15');
      const day2 = response.body.find(item => item.date === '2025-07-16');

      expect(day1.Reading).toBe(90); // 60 + 30
      expect(day1.Writing).toBe(0);
      expect(day1.Running).toBe(0);

      expect(day2.Reading).toBe(0);
      expect(day2.Writing).toBe(90);
      expect(day2.Running).toBe(45);
    });

    it('should return stacked time insights for weekly interval', async () => {
      // When - Making get insights request for timePerTitleStacked with weekly interval
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked&start=2025-07-14T00:00:00Z&end=2025-07-20T23:59:59Z&interval=weekly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return stacked data by week
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('week');
      expect(response.body[0].Reading).toBe(90);
      expect(response.body[0].Writing).toBe(90);
      expect(response.body[0].Running).toBe(45);
    });

    it('should return stacked time insights for monthly interval', async () => {
      // When - Making get insights request for timePerTitleStacked with monthly interval
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked&start=2025-07-01T00:00:00Z&end=2025-07-31T23:59:59Z&interval=monthly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return stacked data by month
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('month');
      expect(response.body[0].Reading).toBe(90);
      expect(response.body[0].Writing).toBe(90);
      expect(response.body[0].Running).toBe(45);
    });

    it('should default to daily interval when not specified', async () => {
      // When - Making get insights request without interval
      const response = await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked&start=2025-07-15T00:00:00Z&end=2025-07-16T23:59:59Z')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return daily stacked data
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[1]).toHaveProperty('date');
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get insights request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked')
        .expect(401);
    });
  });

  describe('/insights with invalid metric (GET)', () => {
    it('should return 500 for invalid metric type', async () => {
      // When - Making get insights request with invalid metric
      // Then - Should return server error
      await request(app.getHttpServer())
        .get('/insights?metric=invalidMetric')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(500);
    });
  });

  describe('/insights with validation errors (GET)', () => {
    it('should return 400 for invalid date format', async () => {
      // When - Making get insights request with invalid date
      // Then - Should return validation error
      await request(app.getHttpServer())
        .get('/insights?metric=timePerTitle&start=invalid-date')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 400 for invalid interval', async () => {
      // When - Making get insights request with invalid interval
      // Then - Should return validation error
      await request(app.getHttpServer())
        .get('/insights?metric=timePerTitleStacked&interval=invalid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
