import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ description: 'Start date' })
  from: string;

  @ApiProperty({ description: 'End date' })
  to: string;
}

export class TimePerTitleDataDto {
  @ApiProperty({ description: 'Activity title' })
  name: string;

  @ApiProperty({ description: 'Total duration in minutes' })
  durationMinutes: number;
}


export class InsightsTimePerTitleDto {
  @ApiProperty({ description: 'Metric type', enum: ['timePerTitle'] })
  metric: 'timePerTitle';

  @ApiProperty({ type: DateRangeDto, description: 'Date range for the data' })
  date_range: DateRangeDto;

  @ApiProperty({ type: [TimePerTitleDataDto], description: 'Time per title data' })
  data: TimePerTitleDataDto[];
}

export class InsightsTimePerTitleStackedDto {
  @ApiProperty({ description: 'Metric type', enum: ['timePerTitleStacked'] })
  metric: 'timePerTitleStacked';

  @ApiProperty({ type: DateRangeDto, description: 'Date range for the data' })
  date_range: DateRangeDto;

  @ApiProperty({ description: 'Data interval', enum: ['daily', 'weekly', 'monthly'] })
  interval: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Stacked time data' })
  data: Record<string, any>[];
}

export type InsightsResponseDto = InsightsTimePerTitleDto | InsightsTimePerTitleStackedDto;
