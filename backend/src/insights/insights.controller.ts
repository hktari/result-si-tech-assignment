import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { InsightsResponseDto, InsightsTimePerTitleDto, InsightsTimePerTitleStackedDto } from './dto/insights-response.dto';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @ApiOperation({ summary: 'Get activity insights and analytics data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Insights retrieved successfully',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            metric: { type: 'string', enum: ['timePerTitle'] },
            date_range: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' }
              }
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  durationMinutes: { type: 'number' }
                }
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            metric: { type: 'string', enum: ['timePerTitleStacked'] },
            date_range: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' }
              }
            },
            interval: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            data: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @Get()
  getInsights(@Query() query: InsightsQueryDto, @Request() req): Promise<InsightsResponseDto> {
    return this.insightsService.getInsights(req.user.id, query);
  }
}
