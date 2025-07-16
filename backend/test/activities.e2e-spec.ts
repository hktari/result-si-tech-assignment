import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('ActivitiesController (e2e)', () => {
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
    await prismaService.activity.deleteMany();
    await prismaService.user.deleteMany();

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
  });

  describe('/activities (POST)', () => {
    it('should create activity successfully', async () => {
      // Given - Valid activity data
      const activityData = {
        title: 'Reading',
        description: 'Reading technical books',
        duration: 60,
        timestamp: '2025-07-16T10:00:00Z',
      };

      // When - Making create activity request
      const response = await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(activityData)
        .expect(201);

      // Then - Should return created activity
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(activityData.title);
      expect(response.body.description).toBe(activityData.description);
      expect(response.body.duration).toBe(activityData.duration);
      expect(response.body.userId).toBe(userId);
      expect(new Date(response.body.timestamp)).toEqual(new Date(activityData.timestamp));
    });

    it('should create activity with current timestamp when not provided', async () => {
      // Given - Activity data without timestamp
      const activityData = {
        title: 'Running',
        duration: 30,
      };

      // When - Making create activity request
      const response = await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(activityData)
        .expect(201);

      // Then - Should return created activity with current timestamp
      expect(response.body.title).toBe(activityData.title);
      expect(response.body.duration).toBe(activityData.duration);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 for invalid activity data', async () => {
      // Given - Invalid activity data
      const invalidData = {
        title: '', // Empty title
        duration: -10, // Negative duration
      };

      // When - Making create activity request with invalid data
      // Then - Should return validation error
      await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      // Given - Valid activity data but no auth token
      const activityData = {
        title: 'Reading',
        duration: 60,
      };

      // When - Making create activity request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .post('/activities')
        .send(activityData)
        .expect(401);
    });
  });

  describe('/activities (GET)', () => {
    beforeEach(async () => {
      // Given - Create test activities
      await prismaService.activity.createMany({
        data: [
          {
            title: 'Reading',
            description: 'Reading books',
            duration: 60,
            timestamp: new Date('2025-07-16T10:00:00Z'),
            userId,
          },
          {
            title: 'Writing',
            description: 'Writing code',
            duration: 90,
            timestamp: new Date('2025-07-16T11:00:00Z'),
            userId,
          },
          {
            title: 'Reading Articles',
            description: 'Reading tech articles',
            duration: 30,
            timestamp: new Date('2025-07-16T12:00:00Z'),
            userId,
          },
        ],
      });
    });

    it('should return all activities with default pagination', async () => {
      // When - Making get activities request
      const response = await request(app.getHttpServer())
        .get('/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return activities with pagination info
      expect(response.body).toHaveProperty('activities');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(response.body.activities).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.limit).toBe(50);
      expect(response.body.offset).toBe(0);
    });

    it('should return activities with custom pagination', async () => {
      // When - Making get activities request with pagination
      const response = await request(app.getHttpServer())
        .get('/activities?limit=2&offset=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return paginated activities
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.offset).toBe(1);
    });

    it('should return filtered activities with search', async () => {
      // When - Making get activities request with search
      const response = await request(app.getHttpServer())
        .get('/activities?search=reading')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return filtered activities
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.activities.every(activity => 
        activity.title.toLowerCase().includes('reading') || 
        activity.description.toLowerCase().includes('reading')
      )).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get activities request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/activities')
        .expect(401);
    });
  });

  describe('/activities/:id (GET)', () => {
    let activityId: string;

    beforeEach(async () => {
      // Given - Create test activity
      const activity = await prismaService.activity.create({
        data: {
          title: 'Reading',
          description: 'Reading books',
          duration: 60,
          timestamp: new Date(),
          userId,
        },
      });
      activityId = activity.id;
    });

    it('should return single activity', async () => {
      // When - Making get single activity request
      const response = await request(app.getHttpServer())
        .get(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return the activity
      expect(response.body.id).toBe(activityId);
      expect(response.body.title).toBe('Reading');
      expect(response.body.userId).toBe(userId);
    });

    it('should return 404 for non-existent activity', async () => {
      // When - Making get request for non-existent activity
      // Then - Should return not found error
      await request(app.getHttpServer())
        .get('/activities/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get single activity request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get(`/activities/${activityId}`)
        .expect(401);
    });
  });

  describe('/activities/:id (PATCH)', () => {
    let activityId: string;

    beforeEach(async () => {
      // Given - Create test activity
      const activity = await prismaService.activity.create({
        data: {
          title: 'Reading',
          description: 'Reading books',
          duration: 60,
          timestamp: new Date(),
          userId,
        },
      });
      activityId = activity.id;
    });

    it('should update activity successfully', async () => {
      // Given - Update data
      const updateData = {
        title: 'Updated Reading',
        duration: 90,
      };

      // When - Making update activity request
      const response = await request(app.getHttpServer())
        .patch(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      // Then - Should return updated activity
      expect(response.body.id).toBe(activityId);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.duration).toBe(updateData.duration);
      expect(response.body.description).toBe('Reading books'); // Unchanged
    });

    it('should return 404 for non-existent activity', async () => {
      // Given - Update data
      const updateData = { title: 'Updated' };

      // When - Making update request for non-existent activity
      // Then - Should return not found error
      await request(app.getHttpServer())
        .patch('/activities/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      // Given - Update data
      const updateData = { title: 'Updated' };

      // When - Making update activity request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .patch(`/activities/${activityId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('/activities/:id (DELETE)', () => {
    let activityId: string;

    beforeEach(async () => {
      // Given - Create test activity
      const activity = await prismaService.activity.create({
        data: {
          title: 'Reading',
          description: 'Reading books',
          duration: 60,
          timestamp: new Date(),
          userId,
        },
      });
      activityId = activity.id;
    });

    it('should delete activity successfully', async () => {
      // When - Making delete activity request
      const response = await request(app.getHttpServer())
        .delete(`/activities/${activityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return deleted activity
      expect(response.body.id).toBe(activityId);

      // Verify activity is deleted
      const deletedActivity = await prismaService.activity.findUnique({
        where: { id: activityId },
      });
      expect(deletedActivity).toBeNull();
    });

    it('should return 404 for non-existent activity', async () => {
      // When - Making delete request for non-existent activity
      // Then - Should return not found error
      await request(app.getHttpServer())
        .delete('/activities/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making delete activity request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .delete(`/activities/${activityId}`)
        .expect(401);
    });
  });

  describe('/activities/today (GET)', () => {
    beforeEach(async () => {
      // Given - Create activities for today and yesterday
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      await prismaService.activity.createMany({
        data: [
          {
            title: 'Today Reading',
            duration: 60,
            timestamp: today,
            userId,
          },
          {
            title: 'Yesterday Reading',
            duration: 30,
            timestamp: yesterday,
            userId,
          },
        ],
      });
    });

    it('should return only today\'s activities', async () => {
      // When - Making get today activities request
      const response = await request(app.getHttpServer())
        .get('/activities/today')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return only today's activities
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Today Reading');
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get today activities request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/activities/today')
        .expect(401);
    });
  });

  describe('/activities/suggestions (GET)', () => {
    beforeEach(async () => {
      // Given - Create activities for suggestions
      await prismaService.activity.createMany({
        data: [
          { title: 'Reading', duration: 60, timestamp: new Date(), userId },
          { title: 'Reading Books', duration: 30, timestamp: new Date(), userId },
          { title: 'Writing', duration: 45, timestamp: new Date(), userId },
        ],
      });
    });

    it('should return activity suggestions with query', async () => {
      // When - Making get suggestions request with query
      const response = await request(app.getHttpServer())
        .get('/activities/suggestions?q=reading')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return filtered suggestions
      expect(response.body).toHaveLength(2);
      expect(response.body).toContain('Reading');
      expect(response.body).toContain('Reading Books');
    });

    it('should return all suggestions without query', async () => {
      // When - Making get suggestions request without query
      const response = await request(app.getHttpServer())
        .get('/activities/suggestions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then - Should return all unique titles
      expect(response.body).toHaveLength(3);
      expect(response.body).toContain('Reading');
      expect(response.body).toContain('Reading Books');
      expect(response.body).toContain('Writing');
    });

    it('should return 401 when not authenticated', async () => {
      // When - Making get suggestions request without token
      // Then - Should return unauthorized error
      await request(app.getHttpServer())
        .get('/activities/suggestions')
        .expect(401);
    });
  });
});
