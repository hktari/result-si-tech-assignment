import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string

  @ApiProperty({ description: 'User email' })
  email: string

  @ApiProperty({ description: 'User name', required: false })
  name?: string

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string

  @ApiProperty({ description: 'User information' })
  user: UserResponseDto
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string

  @ApiProperty({ description: 'Created user information' })
  user: UserResponseDto
}
