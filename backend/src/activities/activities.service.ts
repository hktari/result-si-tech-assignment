import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import {
  ActivityResponseDto,
  ActivitiesListResponseDto,
  ActivitySuggestionResponseDto,
  DeleteActivityResponseDto,
} from './dto/activity-response.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createActivityDto: CreateActivityDto
  ): Promise<ActivityResponseDto> {
    return this.prisma.activity.create({
      data: {
        title: createActivityDto.title,
        description: createActivityDto.description,
        duration: createActivityDto.duration,
        timestamp: createActivityDto.timestamp
          ? new Date(createActivityDto.timestamp)
          : new Date(),
        userId,
      },
    })
  }

  async findAll(
    userId: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<ActivitiesListResponseDto> {
    const where: Prisma.ActivityWhereInput = {
      userId,
    }

    // Add search functionality
    if (search) {
      const keywords = search.trim().split(/\s+/)
      const searchConditions = keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' as const } },
          { description: { contains: keyword, mode: 'insensitive' as const } },
        ],
      }))

      where.AND = searchConditions
    }

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activity.count({ where }),
    ])

    return {
      activities,
      total,
    }
  }

  async findOne(id: string, userId: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    })

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return activity
  }

  async update(
    id: string,
    userId: string,
    updateActivityDto: UpdateActivityDto
  ): Promise<ActivityResponseDto> {
    // First check if activity exists and belongs to user
    await this.findOne(id, userId)

    const updateData: Prisma.ActivityUpdateInput = {}

    if (updateActivityDto.title !== undefined) {
      updateData.title = updateActivityDto.title
    }
    if (updateActivityDto.description !== undefined) {
      updateData.description = updateActivityDto.description
    }
    if (updateActivityDto.duration !== undefined) {
      updateData.duration = updateActivityDto.duration
    }
    if (updateActivityDto.timestamp !== undefined) {
      updateData.timestamp = new Date(updateActivityDto.timestamp)
    }

    return this.prisma.activity.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: string, userId: string): Promise<DeleteActivityResponseDto> {
    // First check if activity exists and belongs to user
    await this.findOne(id, userId)

    await this.prisma.activity.delete({
      where: { id },
    })

    return {
      message: 'Activity deleted successfully',
      id,
    }
  }

  async getTodayActivities(userId: string): Promise<ActivityResponseDto[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.prisma.activity.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { timestamp: 'desc' },
    })
  }

  async getActivitySuggestions(
    userId: string,
    query?: string
  ): Promise<ActivitySuggestionResponseDto[]> {
    const where: Prisma.ActivityWhereInput = {
      userId,
    }

    if (query) {
      where.title = {
        contains: query,
        mode: 'insensitive',
      }
    }

    // Get activity titles with their counts
    const titleCounts = await this.prisma.activity.groupBy({
      by: ['title'],
      where,
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

    return titleCounts.map(item => ({
      title: item.title,
      count: item._count.title,
    }))
  }
}
