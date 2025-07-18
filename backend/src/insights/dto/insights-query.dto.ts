import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class InsightsQueryDto {
  @ApiProperty({
    example: 'timePerTitle',
    description: 'Metric type for insights',
    enum: ['timePerTitle', 'timePerTitleStacked'],
  })
  @IsString()
  @IsIn(['timePerTitle', 'timePerTitleStacked'])
  metric: 'timePerTitle' | 'timePerTitleStacked'

  @ApiProperty({ example: '2025-07-01', required: false })
  @IsOptional()
  @IsDateString()
  start?: string

  @ApiProperty({ example: '2025-07-31', required: false })
  @IsOptional()
  @IsDateString()
  end?: string

  @ApiProperty({
    example: 'daily',
    required: false,
    enum: ['daily', 'weekly', 'monthly'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  interval?: 'daily' | 'weekly' | 'monthly'

  @ApiProperty({ example: 'reading', required: false })
  @IsOptional()
  @IsString()
  search?: string
}
