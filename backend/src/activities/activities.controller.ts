import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import { ActivitiesService } from './activities.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import {
  ActivityResponseDto,
  ActivitiesListResponseDto,
  ActivitySuggestionResponseDto,
  DeleteActivityResponseDto,
} from './dto/activity-response.dto'

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: 201,
    description: 'Activity created successfully',
    type: ActivityResponseDto,
  })
  @Post()
  create(
    @Request() req,
    @Body() createActivityDto: CreateActivityDto
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.create(req.user.id, createActivityDto)
  }

  @ApiOperation({ summary: 'Get all activities for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    type: ActivitiesListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in title and description',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of activities to skip',
  })
  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<ActivitiesListResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 50
    const offsetNum = offset ? parseInt(offset, 10) : 0
    return this.activitiesService.findAll(
      req.user.id,
      search,
      limitNum,
      offsetNum
    )
  }

  @ApiOperation({ summary: "Get today's activities" })
  @ApiResponse({
    status: 200,
    description: "Today's activities retrieved successfully",
    type: [ActivityResponseDto],
  })
  @Get('today')
  getTodayActivities(@Request() req): Promise<ActivityResponseDto[]> {
    return this.activitiesService.getTodayActivities(req.user.id)
  }

  @ApiOperation({ summary: 'Get activity title suggestions' })
  @ApiResponse({
    status: 200,
    description: 'Activity suggestions retrieved successfully',
    type: [ActivitySuggestionResponseDto],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Query for title suggestions',
  })
  @Get('suggestions')
  getSuggestions(
    @Request() req,
    @Query('q') query?: string
  ): Promise<ActivitySuggestionResponseDto[]> {
    return this.activitiesService.getActivitySuggestions(req.user.id, query)
  }

  @ApiOperation({ summary: 'Get a specific activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.findOne(id, req.user.id)
  }

  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity updated successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateActivityDto: UpdateActivityDto
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.update(id, req.user.id, updateActivityDto)
  }

  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity deleted successfully',
    type: DeleteActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<DeleteActivityResponseDto> {
    return this.activitiesService.remove(id, req.user.id)
  }
}
