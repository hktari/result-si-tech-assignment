import { ApiProperty } from '@nestjs/swagger';

export class ActivityResponseDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({ description: 'Activity title' })
  title: string;

  @ApiProperty({ description: 'Activity description', required: false })
  description?: string;

  @ApiProperty({ description: 'Activity duration in minutes' })
  duration: number;

  @ApiProperty({ description: 'Activity timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'User ID who created the activity' })
  userId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ActivitiesListResponseDto {
  @ApiProperty({ type: [ActivityResponseDto], description: 'List of activities' })
  activities: ActivityResponseDto[];

  @ApiProperty({ description: 'Total number of activities' })
  total: number;
}

export class ActivitySuggestionResponseDto {
  @ApiProperty({ description: 'Suggested activity title' })
  title: string;

  @ApiProperty({ description: 'Number of times this activity was used' })
  count: number;
}

export class DeleteActivityResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Deleted activity ID' })
  id: string;
}
