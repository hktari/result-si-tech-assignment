import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

describe('AuthController', () => {
  let authController: AuthController
  let mockAuthService: jest.Mocked<AuthService>

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const mockAuthServiceProvider = {
      provide: AuthService,
      useValue: {
        login: jest.fn(),
        register: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [mockAuthServiceProvider],
    }).compile()

    authController = module.get<AuthController>(AuthController)
    mockAuthService = module.get(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should return access token and user data when login is successful', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }
      const expectedResult = {
        access_token: 'jwt-token-123',
        user: {
          id: 'user1',
          email: inputLoginDto.email,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockAuthService.login.mockResolvedValue(expectedResult)

      // Act
      const actualResult = await authController.login(inputLoginDto)

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockAuthService.login).toHaveBeenCalledWith(inputLoginDto)
    })

    it('should throw UnauthorizedException when login fails', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      )

      // Act & Assert
      await expect(authController.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException
      )
      expect(mockAuthService.login).toHaveBeenCalledWith(inputLoginDto)
    })
  })

  describe('register', () => {
    it('should return user data when registration is successful', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }
      const expectedResult = {
        message: 'User registered successfully',
        user: {
          id: 'user1',
          name: inputRegisterDto.name,
          email: inputRegisterDto.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockAuthService.register.mockResolvedValue(expectedResult)

      // Act
      const actualResult = await authController.register(inputRegisterDto)

      // Assert
      expect(actualResult).toEqual(expectedResult)
      expect(mockAuthService.register).toHaveBeenCalledWith(inputRegisterDto)
    })
  })

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
        },
      }
      const expectedResult = mockRequest.user

      // Act
      const actualResult = authController.getProfile(mockRequest)

      // Assert
      expect(actualResult).toEqual(expectedResult)
    })
  })
})
