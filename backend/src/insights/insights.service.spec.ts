import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { mockPrismaService } from '../test/setup';

describe('InsightsService', () => {
  let insightsService: InsightsService;
  let mockPrisma: typeof mockPrismaService;

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    insightsService = module.get<InsightsService>(InsightsService);
    mockPrisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInsights', () => {
    it('should return timePerTitle insights when metric is timePerTitle', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
      };
      const mockGroupByResult = [
        { title: 'Reading', _sum: { duration: 120 } },
        { title: 'Running', _sum: { duration: 90 } },
      ];
      const expectedResult = [
        { title: 'Reading', totalDuration: 120 },
        { title: 'Running', totalDuration: 90 },
      ];

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult);

      // Act
      const actualResult = await insightsService.getInsights(inputUserId, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          timestamp: {
            gte: new Date(inputQuery.start),
            lte: new Date(inputQuery.end),
          },
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } },
      });
    });

    it('should return timePerTitleStacked insights when metric is timePerTitleStacked', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitleStacked',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
        interval: 'daily',
      };
      const mockActivities = [
        {
          title: 'Reading',
          duration: 60,
          timestamp: new Date('2025-07-15T10:00:00Z'),
        },
        {
          title: 'Reading',
          duration: 30,
          timestamp: new Date('2025-07-15T14:00:00Z'),
        },
        {
          title: 'Running',
          duration: 45,
          timestamp: new Date('2025-07-16T08:00:00Z'),
        },
      ];
      const expectedResult = [
        {
          date: '2025-07-15',
          Reading: 90,
          Running: 0,
        },
        {
          date: '2025-07-16',
          Reading: 0,
          Running: 45,
        },
      ];

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);

      // Act
      const actualResult = await insightsService.getInsights(inputUserId, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          userId: inputUserId,
          timestamp: {
            gte: new Date(inputQuery.start),
            lte: new Date(inputQuery.end),
          },
        },
        select: {
          title: true,
          duration: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should use default date range when start and end not provided', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
      };
      const mockCurrentDate = new Date('2025-07-16T12:00:00Z');
      const expectedStartDate = new Date(mockCurrentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      jest.spyOn(global, 'Date').mockImplementation((dateString?: string) => {
        if (dateString) return new Date(dateString) as any;
        return mockCurrentDate as any;
      });
      mockPrisma.activity.groupBy.mockResolvedValue([]);

      // Act
      await insightsService.getInsights(inputUserId, inputQuery);

      // Assert
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          timestamp: {
            gte: expectedStartDate,
            lte: mockCurrentDate,
          },
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } },
      });

      // Cleanup
      jest.restoreAllMocks();
    });

    it('should include search filter when provided', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        search: 'reading',
      };
      const mockCurrentDate = new Date('2025-07-16T12:00:00Z');
      const expectedStartDate = new Date(mockCurrentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      jest.spyOn(global, 'Date').mockImplementation((dateString?: string) => {
        if (dateString) return new Date(dateString) as any;
        return mockCurrentDate as any;
      });
      mockPrisma.activity.groupBy.mockResolvedValue([]);

      // Act
      await insightsService.getInsights(inputUserId, inputQuery);

      // Assert
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          timestamp: {
            gte: expectedStartDate,
            lte: mockCurrentDate,
          },
          OR: [
            { title: { contains: 'reading', mode: 'insensitive' } },
            { description: { contains: 'reading', mode: 'insensitive' } },
          ],
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } },
      });

      // Cleanup
      jest.restoreAllMocks();
    });

    it('should throw error for invalid metric type', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputQuery: InsightsQueryDto = {
        metric: 'invalidMetric' as any,
      };

      // Act & Assert
      await expect(insightsService.getInsights(inputUserId, inputQuery)).rejects.toThrow('Invalid metric type');
    });
  });

  describe('getTimePerTitle', () => {
    it('should return aggregated time per title', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputStartDate = new Date('2025-07-01T00:00:00Z');
      const inputEndDate = new Date('2025-07-16T23:59:59Z');
      const mockGroupByResult = [
        { title: 'Reading', _sum: { duration: 180 } },
        { title: 'Writing', _sum: { duration: 120 } },
      ];
      const expectedResult = [
        { title: 'Reading', totalDuration: 180 },
        { title: 'Writing', totalDuration: 120 },
      ];

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult);

      // Act
      const actualResult = await insightsService.getTimePerTitle(inputUserId, inputStartDate, inputEndDate);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          timestamp: {
            gte: inputStartDate,
            lte: inputEndDate,
          },
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } },
      });
    });
  });

  describe('getTimePerTitleStacked', () => {
    it('should return stacked time data for daily interval', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputStartDate = new Date('2025-07-15T00:00:00Z');
      const inputEndDate = new Date('2025-07-16T23:59:59Z');
      const inputInterval = 'daily';
      const mockActivities = [
        {
          title: 'Reading',
          duration: 60,
          timestamp: new Date('2025-07-15T10:00:00Z'),
        },
        {
          title: 'Writing',
          duration: 30,
          timestamp: new Date('2025-07-15T14:00:00Z'),
        },
        {
          title: 'Reading',
          duration: 45,
          timestamp: new Date('2025-07-16T09:00:00Z'),
        },
      ];
      const expectedResult = [
        {
          date: '2025-07-15',
          Reading: 60,
          Writing: 30,
        },
        {
          date: '2025-07-16',
          Reading: 45,
          Writing: 0,
        },
      ];

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);

      // Act
      const actualResult = await insightsService.getTimePerTitleStacked(
        inputUserId,
        inputStartDate,
        inputEndDate,
        inputInterval,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          userId: inputUserId,
          timestamp: {
            gte: inputStartDate,
            lte: inputEndDate,
          },
        },
        select: {
          title: true,
          duration: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should return stacked time data for weekly interval', async () => {
      // Arrange
      const inputUserId = 'user1';
      const inputStartDate = new Date('2025-07-07T00:00:00Z'); // Monday
      const inputEndDate = new Date('2025-07-20T23:59:59Z');
      const inputInterval = 'weekly';
      const mockActivities = [
        {
          title: 'Reading',
          duration: 60,
          timestamp: new Date('2025-07-08T10:00:00Z'), // Week 28
        },
        {
          title: 'Reading',
          duration: 30,
          timestamp: new Date('2025-07-15T10:00:00Z'), // Week 29
        },
      ];

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities);

      // Act
      const actualResult = await insightsService.getTimePerTitleStacked(
        inputUserId,
        inputStartDate,
        inputEndDate,
        inputInterval,
      );

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult[0]).toHaveProperty('week');
      expect(actualResult[0]).toHaveProperty('Reading');
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          userId: inputUserId,
          timestamp: {
            gte: inputStartDate,
            lte: inputEndDate,
          },
        },
        select: {
          title: true,
          duration: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'asc' },
      });
    });
  });
});
