import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcryptjs'

// Mock bcrypt
jest.mock('bcryptjs')
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('AuthService', () => {
  let authService: AuthService
  let mockUsersService: jest.Mocked<UsersService>
  let mockJwtService: jest.Mocked<JwtService>

  beforeEach(async () => {
    // Arrange - Create mocks
    const mockUsersServiceProvider = {
      provide: UsersService,
      useValue: {
        findByEmail: jest.fn(),
        create: jest.fn(),
      },
    }

    const mockJwtServiceProvider = {
      provide: JwtService,
      useValue: {
        sign: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        mockUsersServiceProvider,
        mockJwtServiceProvider,
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    mockUsersService = module.get(UsersService)
    mockJwtService = module.get(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      const inputEmail = 'test@example.com'
      const inputPassword = 'password123'
      const mockUser = {
        id: 'user1',
        email: inputEmail,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }
      const expectedResult = {
        id: 'user1',
        email: inputEmail,
        name: 'Test User',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        preferences: null,
      }

      mockUsersService.findByEmail.mockResolvedValue(mockUser)
      mockedBcrypt.compare.mockResolvedValue(true as never)

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword
      )

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail)
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        'hashedPassword'
      )
    })

    it('should return null when user is not found', async () => {
      // Arrange
      const inputEmail = 'nonexistent@example.com'
      const inputPassword = 'password123'

      mockUsersService.findByEmail.mockResolvedValue(null)

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword
      )

      // Assert
      expect(actualResult).toBeNull()
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail)
      expect(mockedBcrypt.compare).not.toHaveBeenCalled()
    })

    it('should return null when password is invalid', async () => {
      // Arrange
      const inputEmail = 'test@example.com'
      const inputPassword = 'wrongpassword'
      const mockUser = {
        id: 'user1',
        email: inputEmail,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }

      mockUsersService.findByEmail.mockResolvedValue(mockUser)
      mockedBcrypt.compare.mockResolvedValue(false as never)

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword
      )

      // Assert
      expect(actualResult).toBeNull()
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail)
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        'hashedPassword'
      )
    })
  })

  describe('login', () => {
    it('should return access token and user data when credentials are valid', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }
      const mockUser = {
        id: 'user1',
        email: inputLoginDto.email,
        name: 'Test User',
      }
      const mockToken = 'jwt-token-123'
      const expectedResult = {
        access_token: mockToken,
        user: mockUser,
      }

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser)
      mockJwtService.sign.mockReturnValue(mockToken)

      // Act
      const actualResult = await authService.login(inputLoginDto)

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(authService.validateUser).toHaveBeenCalledWith(
        inputLoginDto.email,
        inputLoginDto.password
      )
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      })
    })

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException
      )
      expect(authService.validateUser).toHaveBeenCalledWith(
        inputLoginDto.email,
        inputLoginDto.password
      )
      expect(mockJwtService.sign).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('should create user and return user data without password', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }
      const mockHashedPassword = 'hashedPassword123'
      const mockCreatedUser = {
        id: 'user1',
        name: inputRegisterDto.name,
        email: inputRegisterDto.email,
        password: mockHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }
      const expectedResult = {
        message: 'User registered successfully',
        user: {
          id: 'user1',
          email: inputRegisterDto.email,
          name: inputRegisterDto.name,
          createdAt: mockCreatedUser.createdAt,
          updatedAt: mockCreatedUser.updatedAt,
        },
      }

      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never)
      mockUsersService.create.mockResolvedValue(mockCreatedUser)

      // Act
      const actualResult = await authService.register(inputRegisterDto)

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        inputRegisterDto.password,
        10
      )
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...inputRegisterDto,
        password: mockHashedPassword,
      })
    })
  })
})
