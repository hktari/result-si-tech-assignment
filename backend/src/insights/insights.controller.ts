import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @ApiOperation({ summary: 'Get activity insights and analytics data' })
  @ApiResponse({ status: 200, description: 'Insights data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @Get()
  getInsights(@Request() req, @Query() query: InsightsQueryDto) {
    return this.insightsService.getInsights(req.user.id, query);
  }
}
