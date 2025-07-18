import { PrismaClient } from '@prisma/client'

// Global test setup
beforeAll(async () => {
  // Setup test database connection if needed
})

afterAll(async () => {
  // Cleanup test database if needed
})

// Mock Prisma for unit tests
export const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  activity: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}
