import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateActivityDto {
  @ApiProperty({ example: 'Reading' })
  @IsString()
  title: string

  @ApiProperty({ example: 'Reading technical books', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  duration: number

  @ApiProperty({ example: '2025-07-16T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string
}
