import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { mockPrismaService } from '../test/setup'

describe('ActivitiesService', () => {
  let activitiesService: ActivitiesService
  let mockPrisma: typeof mockPrismaService

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    activitiesService = module.get<ActivitiesService>(ActivitiesService)
    mockPrisma = module.get(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create activity successfully with provided timestamp', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputCreateDto: CreateActivityDto = {
        title: 'Reading',
        description: 'Reading technical books',
        duration: 60,
        timestamp: '2025-07-16T10:00:00Z',
      }
      const expectedActivity = {
        id: 'activity1',
        title: inputCreateDto.title,
        description: inputCreateDto.description,
        duration: inputCreateDto.duration,
        timestamp: new Date(inputCreateDto.timestamp),
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.activity.create.mockResolvedValue(expectedActivity)

      // Act
      const actualResult = await activitiesService.create(
        inputUserId,
        inputCreateDto
      )

      // Assert
      expect(actualResult).toEqual(expectedActivity)
      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: {
          title: inputCreateDto.title,
          description: inputCreateDto.description,
          duration: inputCreateDto.duration,
          timestamp: new Date(inputCreateDto.timestamp),
          userId: inputUserId,
        },
      })
    })

    it('should create activity with current timestamp when not provided', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputCreateDto: CreateActivityDto = {
        title: 'Running',
        duration: 30,
      }
      const mockCurrentDate = new Date('2025-07-16T12:00:00Z')
      const expectedActivity = {
        id: 'activity1',
        title: inputCreateDto.title,
        description: null,
        duration: inputCreateDto.duration,
        timestamp: mockCurrentDate,
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockCurrentDate as any)
      mockPrisma.activity.create.mockResolvedValue(expectedActivity)

      // Act
      const actualResult = await activitiesService.create(
        inputUserId,
        inputCreateDto
      )

      // Assert
      expect(actualResult).toEqual(expectedActivity)
      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: {
          title: inputCreateDto.title,
          description: undefined,
          duration: inputCreateDto.duration,
          timestamp: mockCurrentDate,
          userId: inputUserId,
        },
      })

      // Cleanup
      jest.restoreAllMocks()
    })
  })

  describe('findAll', () => {
    it('should return activities without search filter', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputLimit = 10
      const inputOffset = 0
      const mockActivity = {
        id: 'activity1',
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockTotal = 1
      const expectedResult = {
        activities: [mockActivity],
        total: 1,
      }

      mockPrisma.activity.findMany.mockResolvedValue([mockActivity])
      mockPrisma.activity.count.mockResolvedValue(mockTotal)

      // Act
      const actualResult = await activitiesService.findAll(
        inputUserId,
        undefined,
        inputLimit,
        inputOffset
      )

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId: inputUserId },
        orderBy: { timestamp: 'desc' },
        take: inputLimit,
        skip: inputOffset,
      })
      expect(mockPrisma.activity.count).toHaveBeenCalledWith({
        where: { userId: inputUserId },
      })
    })

    it('should return activities with search filter', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputSearch = 'reading books'
      const inputLimit = 50
      const inputOffset = 0
      const mockActivities = []
      const mockTotal = 0
      const expectedWhereClause = {
        userId: inputUserId,
        AND: [
          {
            OR: [
              { title: { contains: 'reading', mode: 'insensitive' } },
              { description: { contains: 'reading', mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { title: { contains: 'books', mode: 'insensitive' } },
              { description: { contains: 'books', mode: 'insensitive' } },
            ],
          },
        ],
      }

      mockPrisma.activity.findMany.mockResolvedValue(mockActivities)
      mockPrisma.activity.count.mockResolvedValue(mockTotal)

      // Act
      const actualResult = await activitiesService.findAll(
        inputUserId,
        inputSearch,
        inputLimit,
        inputOffset
      )

      // Assert
      expect(actualResult.activities).toEqual(mockActivities)
      expect(actualResult.total).toEqual(mockTotal)
      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: expectedWhereClause,
        orderBy: { timestamp: 'desc' },
        take: inputLimit,
        skip: inputOffset,
      })
    })
  })

  describe('findOne', () => {
    it('should return activity when found and user owns it', async () => {
      // Arrange
      const inputId = 'activity1'
      const inputUserId = 'user1'
      const expectedActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.activity.findUnique.mockResolvedValue(expectedActivity)

      // Act
      const actualResult = await activitiesService.findOne(inputId, inputUserId)

      // Assert
      expect(actualResult).toEqual(expectedActivity)
      expect(mockPrisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: inputId },
      })
    })

    it('should throw NotFoundException when activity not found', async () => {
      // Arrange
      const inputId = 'nonexistent-activity'
      const inputUserId = 'user1'

      mockPrisma.activity.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(
        activitiesService.findOne(inputId, inputUserId)
      ).rejects.toThrow(NotFoundException)
      expect(mockPrisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: inputId },
      })
    })

    it('should throw ForbiddenException when user does not own activity', async () => {
      // Arrange
      const inputId = 'activity1'
      const inputUserId = 'user1'
      const mockActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: 'different-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.activity.findUnique.mockResolvedValue(mockActivity)

      // Act & Assert
      await expect(
        activitiesService.findOne(inputId, inputUserId)
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('update', () => {
    it('should update activity successfully', async () => {
      // Arrange
      const inputId = 'activity1'
      const inputUserId = 'user1'
      const inputUpdateDto: UpdateActivityDto = {
        title: 'Updated Reading',
        duration: 90,
      }
      const mockExistingActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const expectedUpdatedActivity = {
        ...mockExistingActivity,
        title: inputUpdateDto.title,
        duration: inputUpdateDto.duration,
      }

      jest
        .spyOn(activitiesService, 'findOne')
        .mockResolvedValue(mockExistingActivity)
      mockPrisma.activity.update.mockResolvedValue(expectedUpdatedActivity)

      // Act
      const actualResult = await activitiesService.update(
        inputId,
        inputUserId,
        inputUpdateDto
      )

      // Assert
      expect(actualResult).toEqual(expectedUpdatedActivity)
      expect(activitiesService.findOne).toHaveBeenCalledWith(
        inputId,
        inputUserId
      )
      expect(mockPrisma.activity.update).toHaveBeenCalledWith({
        where: { id: inputId },
        data: {
          title: inputUpdateDto.title,
          duration: inputUpdateDto.duration,
        },
      })
    })
  })

  describe('remove', () => {
    it('should delete activity successfully', async () => {
      // Arrange
      const inputId = 'activity1'
      const inputUserId = 'user1'
      const mockActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: inputUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(activitiesService, 'findOne').mockResolvedValue(mockActivity)
      mockPrisma.activity.delete.mockResolvedValue(mockActivity)

      // Act
      const actualResult = await activitiesService.remove(inputId, inputUserId)

      // Assert
      expect(actualResult).toEqual({
        id: inputId,
        message: 'Activity deleted successfully',
      })
      expect(activitiesService.findOne).toHaveBeenCalledWith(
        inputId,
        inputUserId
      )
      expect(mockPrisma.activity.delete).toHaveBeenCalledWith({
        where: { id: inputId },
      })
    })
  })

  describe('getActivitySuggestions', () => {
    it('should return activity title suggestions', async () => {
      // Arrange
      const inputUserId = 'user1'
      const inputQuery = 'read'
      const mockGroupByResult = [
        { title: 'Reading', _count: { title: 5 } },
        { title: 'Reading Books', _count: { title: 3 } },
      ]
      const expectedSuggestions = [
        { title: 'Reading', count: 5 },
        { title: 'Reading Books', count: 3 },
      ]

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult)

      // Act
      const actualResult = await activitiesService.getActivitySuggestions(
        inputUserId,
        inputQuery
      )

      // Assert
      expect(actualResult).toEqual(expectedSuggestions)
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: {
          userId: inputUserId,
          title: {
            contains: inputQuery,
            mode: 'insensitive',
          },
        },
        _count: {
          title: true,
        },
        orderBy: {
          _count: {
            title: 'desc',
          },
        },
        take: 10,
      })
    })

    it('should return suggestions without query filter', async () => {
      // Arrange
      const inputUserId = 'user1'
      const mockGroupByResult = [
        { title: 'Reading', _count: { title: 10 } },
        { title: 'Running', _count: { title: 8 } },
      ]
      const expectedSuggestions = [
        { title: 'Reading', count: 10 },
        { title: 'Running', count: 8 },
      ]

      mockPrisma.activity.groupBy.mockResolvedValue(mockGroupByResult)

      // Act
      const actualResult =
        await activitiesService.getActivitySuggestions(inputUserId)

      // Assert
      expect(actualResult).toEqual(expectedSuggestions)
      expect(mockPrisma.activity.groupBy).toHaveBeenCalledWith({
        by: ['title'],
        where: { userId: inputUserId },
        _count: {
          title: true,
        },
        orderBy: {
          _count: {
            title: 'desc',
          },
        },
        take: 10,
      })
    })
  })
})
