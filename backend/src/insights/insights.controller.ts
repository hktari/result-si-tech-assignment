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
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Insights retrieved successfully',
  //   schema: {
  //     oneOf: [
  //       { $ref: '#/components/schemas/InsightsTimePerTitleDto' },
  //       { $ref: '#/components/schemas/InsightsTimePerTitleStackedDto' }
  //     ]
  //   }
  // })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @Get()
  getInsights(@Query() query: InsightsQueryDto, @Request() req): Promise<InsightsResponseDto> {
    return this.insightsService.getInsights(req.user.id, query);
  }
}
