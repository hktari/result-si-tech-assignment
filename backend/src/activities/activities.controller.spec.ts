import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

describe('ActivitiesController', () => {
  let activitiesController: ActivitiesController;
  let mockActivitiesService: jest.Mocked<ActivitiesService>;

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const mockActivitiesServiceProvider = {
      provide: ActivitiesService,
      useValue: {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        getTodayActivities: jest.fn(),
        getActivitySuggestions: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [mockActivitiesServiceProvider],
    }).compile();

    activitiesController = module.get<ActivitiesController>(ActivitiesController);
    mockActivitiesService = module.get(ActivitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create activity successfully', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputCreateDto: CreateActivityDto = {
        title: 'Reading',
        description: 'Reading technical books',
        duration: 60,
        timestamp: '2025-07-16T10:00:00Z',
      };
      const expectedActivity = {
        id: 'activity1',
        title: inputCreateDto.title,
        description: inputCreateDto.description,
        duration: inputCreateDto.duration,
        timestamp: new Date(inputCreateDto.timestamp),
        userId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActivitiesService.create.mockResolvedValue(expectedActivity);

      // Act
      const actualResult = await activitiesController.create(mockRequest, inputCreateDto);

      // Assert
      expect(actualResult).toEqual(expectedActivity);
      expect(mockActivitiesService.create).toHaveBeenCalledWith(mockRequest.user.id, inputCreateDto);
    });
  });

  describe('findAll', () => {
    it('should return activities with default pagination', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputSearch = undefined;
      const inputLimit = undefined;
      const inputOffset = undefined;
      const expectedResult = {
        activities: [],
        total: 0,
        limit: 50,
        offset: 0,
      };

      mockActivitiesService.findAll.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await activitiesController.findAll(
        mockRequest,
        inputSearch,
        inputLimit,
        inputOffset,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockActivitiesService.findAll).toHaveBeenCalledWith(
        mockRequest.user.id,
        inputSearch,
        50,
        0,
      );
    });

    it('should return activities with custom pagination and search', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputSearch = 'reading';
      const inputLimit = 10;
      const inputOffset = 20;
      const expectedResult = {
        activities: [],
        total: 0,
        limit: inputLimit,
        offset: inputOffset,
      };

      mockActivitiesService.findAll.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await activitiesController.findAll(
        mockRequest,
        inputSearch,
        inputLimit.toString(),
        inputOffset.toString(),
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockActivitiesService.findAll).toHaveBeenCalledWith(
        mockRequest.user.id,
        inputSearch,
        inputLimit,
        inputOffset,
      );
    });
  });

  describe('findOne', () => {
    it('should return single activity', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputId = 'activity1';
      const expectedActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActivitiesService.findOne.mockResolvedValue(expectedActivity);

      // Act
      const actualResult = await activitiesController.findOne(inputId, mockRequest);

      // Assert
      expect(actualResult).toEqual(expectedActivity);
      expect(mockActivitiesService.findOne).toHaveBeenCalledWith(inputId, mockRequest.user.id);
    });
  });

  describe('update', () => {
    it('should update activity successfully', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputId = 'activity1';
      const inputUpdateDto: UpdateActivityDto = {
        title: 'Updated Reading',
        duration: 90,
      };
      const expectedActivity = {
        id: inputId,
        title: inputUpdateDto.title,
        description: 'Reading books',
        duration: inputUpdateDto.duration,
        timestamp: new Date(),
        userId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActivitiesService.update.mockResolvedValue(expectedActivity);

      // Act
      const actualResult = await activitiesController.update(inputId, mockRequest, inputUpdateDto);

      // Assert
      expect(actualResult).toEqual(expectedActivity);
      expect(mockActivitiesService.update).toHaveBeenCalledWith(inputId, mockRequest.user.id, inputUpdateDto);
    });
  });

  describe('remove', () => {
    it('should delete activity successfully', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputId = 'activity1';
      const expectedActivity = {
        id: inputId,
        title: 'Reading',
        description: 'Reading books',
        duration: 60,
        timestamp: new Date(),
        userId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActivitiesService.remove.mockResolvedValue(expectedActivity);

      // Act
      const actualResult = await activitiesController.remove(inputId, mockRequest);

      // Assert
      expect(actualResult).toEqual(expectedActivity);
      expect(mockActivitiesService.remove).toHaveBeenCalledWith(inputId, mockRequest.user.id);
    });
  });

  describe('getTodayActivities', () => {
    it('should return today\'s activities', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const expectedActivities = [
        {
          id: 'activity1',
          title: 'Reading',
          duration: 60,
          timestamp: new Date(),
          userId: mockRequest.user.id,
        },
      ];

      mockActivitiesService.getTodayActivities.mockResolvedValue(expectedActivities);

      // Act
      const actualResult = await activitiesController.getTodayActivities(mockRequest);

      // Assert
      expect(actualResult).toEqual(expectedActivities);
      expect(mockActivitiesService.getTodayActivities).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('getActivitySuggestions', () => {
    it('should return activity suggestions with query', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputQuery = 'read';
      const expectedSuggestions = ['Reading', 'Reading Books'];

      mockActivitiesService.getActivitySuggestions.mockResolvedValue(expectedSuggestions);

      // Act
      const actualResult = await activitiesController.getSuggestions(mockRequest, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedSuggestions);
      expect(mockActivitiesService.getActivitySuggestions).toHaveBeenCalledWith(
        mockRequest.user.id,
        inputQuery,
      );
    });

    it('should return activity suggestions without query', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputQuery = undefined;
      const expectedSuggestions = ['Reading', 'Running', 'Writing'];

      mockActivitiesService.getActivitySuggestions.mockResolvedValue(expectedSuggestions);

      // Act
      const actualResult = await activitiesController.getSuggestions(mockRequest, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedSuggestions);
      expect(mockActivitiesService.getActivitySuggestions).toHaveBeenCalledWith(
        mockRequest.user.id,
        inputQuery,
      );
    });
  });
});
