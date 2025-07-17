import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: process.env.DEMO_USER_EMAIL || 'demo@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: process.env.DEMO_USER_PASSWORD || 'demo123' })
  @IsString()
  @MinLength(6)
  password: string;
}
