import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import { mockPrismaService } from '../test/setup'

describe('UsersService', () => {
  let usersService: UsersService
  let mockPrisma: typeof mockPrismaService

  beforeEach(async () => {
    // Arrange - Create test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
    mockPrisma = module.get(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const inputUserData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        preferences: { theme: 'light' },
      }
      const expectedUser = {
        id: 'user1',
        email: inputUserData.email,
        name: inputUserData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: inputUserData.preferences,
      }

      mockPrisma.user.create.mockResolvedValue(expectedUser)

      // Act
      const actualResult = await usersService.create(inputUserData)

      // Assert
      expect(actualResult).toEqual(expectedUser)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: inputUserData.email,
          name: inputUserData.name,
          password: inputUserData.password,
          preferences: inputUserData.preferences,
        },
      })
    })

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const inputUserData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
      }
      const mockError = { code: 'P2002' }

      mockPrisma.user.create.mockRejectedValue(mockError)

      // Act & Assert
      await expect(usersService.create(inputUserData)).rejects.toThrow(
        ConflictException
      )
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: inputUserData.email,
          name: inputUserData.name,
          password: inputUserData.password,
          preferences: undefined,
        },
      })
    })

    it('should rethrow other database errors', async () => {
      // Arrange
      const inputUserData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
      }
      const mockError = new Error('Database connection failed')

      mockPrisma.user.create.mockRejectedValue(mockError)

      // Act & Assert
      await expect(usersService.create(inputUserData)).rejects.toThrow(
        'Database connection failed'
      )
    })
  })

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      // Arrange
      const inputEmail = 'test@example.com'
      const expectedUser = {
        id: 'user1',
        email: inputEmail,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser)

      // Act
      const actualResult = await usersService.findByEmail(inputEmail)

      // Assert
      expect(actualResult).toEqual(expectedUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: inputEmail },
      })
    })

    it('should return null when user not found', async () => {
      // Arrange
      const inputEmail = 'nonexistent@example.com'

      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act
      const actualResult = await usersService.findByEmail(inputEmail)

      // Assert
      expect(actualResult).toBeNull()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: inputEmail },
      })
    })
  })

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const inputId = 'user1'
      const expectedUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser)

      // Act
      const actualResult = await usersService.findById(inputId)

      // Assert
      expect(actualResult).toEqual(expectedUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: inputId },
      })
    })

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputId = 'nonexistent-user'

      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(usersService.findById(inputId)).rejects.toThrow(
        NotFoundException
      )
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: inputId },
      })
    })
  })

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const inputId = 'user1'
      const inputUpdateData = { name: 'Updated Name' }
      const expectedUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Updated Name',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: null,
      }

      mockPrisma.user.update.mockResolvedValue(expectedUser)

      // Act
      const actualResult = await usersService.update(inputId, inputUpdateData)

      // Assert
      expect(actualResult).toEqual(expectedUser)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: inputId },
        data: inputUpdateData,
      })
    })
  })
})
