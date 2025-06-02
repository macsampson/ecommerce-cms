import { jest } from '@jest/globals'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import React from 'react'

// Mock Prisma Client
jest.mock('@/lib/prismadb', () => ({
  __esModule: true,
  default: mockDeep<typeof import('@prisma/client').PrismaClient>()
}))

// Mock Clerk's auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'mock-user-id' })), // Default mock for authenticated user
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () =>
    React.createElement(
      'div',
      { 'data-testid': 'user-button-mock' },
      'UserButtonMock'
    )
  // Add other Clerk components or functions you use and want to mock globally
}))

// Mock next/navigation (if needed for components that use useRouter, usePathname, etc.)
// jest.mock('next/navigation', () => ({
//   useRouter: jest.fn(() => ({ push: jest.fn() })),
//   usePathname: jest.fn(() => '/mock-pathname'),
//   useParams: jest.fn(() => ({ storeId: 'mock-store-id' })),
// }));

// You might also want to mock specific utility functions if they are complex or make external calls
// For example, if formatter from '@/lib/utils' is complex:
// jest.mock('@/lib/utils', () => ({
//   ...jest.requireActual('@/lib/utils'), // Import and retain original non-problematic utils
//   formatter: {
//     format: jest.fn((amount) => `$${amount.toFixed(2)}`), // Simple mock for formatter
//   },
// }));

// Reset mocks before each test
beforeEach(() => {
  // prismaMock.user.findUnique.mockReset(); // Example if using named mock instance
  // You can reset specific mocks if needed, or rely on jest.clearAllMocks() if configured in Jest config
})

// Expose Prisma mock instance if you need to manipulate it in tests
// (Not standard to export from setup, usually done via a helper file or directly in tests)
// import prisma from '@/lib/prismadb';
// export const prismaMock = prisma as unknown as DeepMockProxy<typeof import('@prisma/client').PrismaClient>;
