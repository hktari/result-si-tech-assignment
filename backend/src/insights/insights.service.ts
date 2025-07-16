import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { Prisma } from '@prisma/client';
import { InsightsTimePerTitle, InsightsTimePerTitleStacked } from './dto/insights-response.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getInsights(userId: string, query: InsightsQueryDto) {
    const { metric, start, end, interval, search } = query;

    // Set default date range if not provided
    const endDate = end ? new Date(end) : new Date();
    const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    if (metric === 'timePerTitle') {
      return this.getTimePerTitle(userId, startDate, endDate, search);
    } else if (metric === 'timePerTitleStacked') {
      return this.getTimePerTitleStacked(userId, startDate, endDate, interval || 'daily', search);
    }

    throw new Error('Invalid metric type');
  }
  private async getTimePerTitle(userId: string, startDate: Date, endDate: Date, search?: string): Promise<InsightsTimePerTitle> {
    const where: Prisma.ActivityWhereInput = {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (search) {
      const keywords = search.trim().split(/\s+/);
      const searchConditions = keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' as const } },
          { description: { contains: keyword, mode: 'insensitive' as const } },
        ],
      }));
      where.AND = searchConditions;
    }

    const activities = await this.prisma.activity.groupBy({
      by: ['title'],
      where,
      _sum: {
        duration: true,
      },
      orderBy: {
        _sum: {
          duration: 'desc',
        },
      },
    });

    const data = activities.map(activity => ({
      name: activity.title,
      durationMinutes: activity._sum.duration || 0,
    }));

    return {
      metric: 'timePerTitle',
      date_range: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      data,
    };
  }

  private async getTimePerTitleStacked(
    userId: string,
    startDate: Date,
    endDate: Date,
    interval: 'daily' | 'weekly' | 'monthly',
    search?: string,
  ): Promise<InsightsTimePerTitleStacked> {
    const where: Prisma.ActivityWhereInput = {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (search) {
      const keywords = search.trim().split(/\s+/);
      const searchConditions = keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' as const } },
          { description: { contains: keyword, mode: 'insensitive' as const } },
        ],
      }));
      where.AND = searchConditions;
    }

    const activities = await this.prisma.activity.findMany({
      where,
      select: {
        title: true,
        duration: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Group activities by time interval and title
    const groupedData = new Map<string, Record<string, number>>();

    activities.forEach(activity => {
      const timeKey = this.getTimeKey(activity.timestamp, interval);
      
      if (!groupedData.has(timeKey)) {
        groupedData.set(timeKey, {});
      }

      const timeGroup = groupedData.get(timeKey)!;
      timeGroup[activity.title] = (timeGroup[activity.title] || 0) + activity.duration;
    });

    // Convert to array format
    const data = Array.from(groupedData.entries()).map(([timeKey, activities]) => {
      const entry: Record<string, any> = {};
      
      if (interval === 'daily') {
        entry.date = timeKey;
      } else if (interval === 'weekly') {
        entry.week = timeKey;
      } else if (interval === 'monthly') {
        entry.month = timeKey;
      }

      // Add activity durations
      Object.entries(activities).forEach(([title, duration]) => {
        entry[title] = duration;
      });

      return entry;
    });

    return {
      metric: 'timePerTitleStacked',
      date_range: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      interval,
      data,
    };
  }


  private getTimeKey(timestamp: Date, interval: 'daily' | 'weekly' | 'monthly'): string {
    if (interval === 'daily') {
      return timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (interval === 'weekly') {
      const year = timestamp.getFullYear();
      const week = this.getWeekNumber(timestamp);
      return `${year}-W${week.toString().padStart(2, '0')}`;
    } else if (interval === 'monthly') {
      const year = timestamp.getFullYear();
      const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
      return `${year}-${month}`;
    }
    
    return timestamp.toISOString().split('T')[0];
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
