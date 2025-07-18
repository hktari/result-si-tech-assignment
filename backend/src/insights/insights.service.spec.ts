import { Test, TestingModule } from '@nestjs/testing'
import { InsightsService } from './insights.service'
import { PrismaService } from '../prisma/prisma.service'
import { InsightsQueryDto } from './dto/insights-query.dto'
import { mockPrismaService } from '../test/setup'

describe('InsightsService', () => {
  let insightsService: InsightsService
  let mockPrisma: typeof mockPrismaService

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
    }).compile()

    insightsService = module.get<InsightsService>(InsightsService)
    mockPrisma = module.get(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getInsights', () => {
    it('should return timePerTitle insights when metric is timePerTitle', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
      }
      const mockGroupByResult = [
        { title: 'Reading', _sum: { duration: 120 } },
        { title: 'Running', _sum: { duration: 90 } },
      ]
      const expectedResult = {
        metric: 'timePerTitle',
        date_range: {
          from: '2025-07-01',
          to: '2025-07-16',
        },
        data: [
          { name: 'Reading', durationMinutes: 120 },
          { name: 'Running', durationMinutes: 90 },
        ],
      }

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult)

      // Act
      const actualResult = await insightsService.getInsights(
        inputUserId,
        inputQuery
      )

      // Assert
      expect(actualResult).toEqual(expectedResult)
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
      })
    })

    it('should return timePerTitleStacked insights when metric is timePerTitleStacked', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitleStacked',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
        interval: 'daily',
      }
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
      ]
      const expectedResult = {
        metric: 'timePerTitleStacked',
        date_range: {
          from: '2025-07-01',
          to: '2025-07-16',
        },
        interval: 'daily',
        data: [
          {
            date: '2025-07-15',
            Reading: 90,
          },
          {
            date: '2025-07-16',
            Running: 45,
          },
        ],
      }

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities)

      // Act
      const actualResult = await insightsService.getInsights(
        inputUserId,
        inputQuery
      )

      // Assert
      expect(actualResult).toEqual(expectedResult)
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
      })
    })

    it('should include search filter when provided', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
        search: 'reading',
      }
      const mockGroupByResult = [{ title: 'Reading', _sum: { duration: 120 } }]
      const expectedResult = {
        metric: 'timePerTitle',
        date_range: {
          from: '2025-07-01',
          to: '2025-07-16',
        },
        data: [{ name: 'Reading', durationMinutes: 120 }],
      }

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult)

      // Act
      const actualResult = await insightsService.getInsights(
        inputUserId,
        inputQuery
      )

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          timestamp: {
            gte: new Date(inputQuery.start),
            lte: new Date(inputQuery.end),
          },
          AND: [
            {
              OR: [
                { title: { contains: 'reading', mode: 'insensitive' } },
                { description: { contains: 'reading', mode: 'insensitive' } },
              ],
            },
          ],
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } },
      })
    })

    it('should throw error for invalid metric type', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputQuery: InsightsQueryDto = {
        metric: 'invalidMetric' as any,
      }

      // Act & Assert
      await expect(
        insightsService.getInsights(inputUserId, inputQuery)
      ).rejects.toThrow('Invalid metric type')
    })
  })
})
