import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';

describe('InsightsController', () => {
  let insightsController: InsightsController;
  let mockInsightsService: jest.Mocked<InsightsService>;

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const mockInsightsServiceProvider = {
      provide: InsightsService,
      useValue: {
        getInsights: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [mockInsightsServiceProvider],
    }).compile();

    insightsController = module.get<InsightsController>(InsightsController);
    mockInsightsService = module.get(InsightsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInsights', () => {
    it('should return timePerTitle insights', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
      };
      const expectedResult = [
        { title: 'Reading', totalDuration: 180 },
        { title: 'Writing', totalDuration: 120 },
      ];

      mockInsightsService.getInsights.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await insightsController.getInsights(mockRequest, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockInsightsService.getInsights).toHaveBeenCalledWith(mockRequest.user.id, inputQuery);
    });

    it('should return timePerTitleStacked insights', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitleStacked',
        start: '2025-07-01T00:00:00Z',
        end: '2025-07-16T23:59:59Z',
        interval: 'daily',
      };
      const expectedResult = [
        {
          date: '2025-07-15',
          Reading: 90,
          Writing: 60,
        },
        {
          date: '2025-07-16',
          Reading: 45,
          Writing: 30,
        },
      ];

      mockInsightsService.getInsights.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await insightsController.getInsights(mockRequest, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockInsightsService.getInsights).toHaveBeenCalledWith(mockRequest.user.id, inputQuery);
    });

    it('should handle insights with search filter', async () => {
      // Arrange
      const mockRequest = { user: { id: 'user1' } };
      const inputQuery: InsightsQueryDto = {
        metric: 'timePerTitle',
        search: 'reading',
      };
      const expectedResult = [
        { title: 'Reading', totalDuration: 180 },
        { title: 'Reading Books', totalDuration: 90 },
      ];

      mockInsightsService.getInsights.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await insightsController.getInsights(mockRequest, inputQuery);

      // Assert
      expect(actualResult).toEqual(expectedResult);
      expect(mockInsightsService.getInsights).toHaveBeenCalledWith(mockRequest.user.id, inputQuery);
    });
  });
});
