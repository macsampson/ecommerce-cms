import { GET } from './route'; // Adjust path as necessary
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { isAuthenticated } from '@/lib/auth';
import { PrismaClient } from '@prisma/client'; // For typing the mock
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock the auth module
jest.mock('@/lib/auth');

// Explicitly type the mock for prismadb
const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;
// Explicitly type the mock for auth
const authMock = isAuthenticated as jest.Mock;

describe('GET /api/[storeId]/overview/total-revenue', () => {
  const storeId = 'test-store-id';
  const mockUserId = 'mock-user-id';

  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
    // Default auth mock for most tests
    authMock.mockResolvedValue(true);
  });

  it('should return total revenue when authenticated and store found', async () => {
    const mockOrders = [
      {
        orderItems: [
          { product: { price: { toNumber: () => 100 } } },
          { product: { price: { toNumber: () => 50 } } },
        ],
      },
      {
        orderItems: [{ product: { price: { toNumber: () => 200 } } }],
      },
    ];

    prismaMock.store.findFirst.mockResolvedValue({ id: storeId, userId: 'single-user' } as any);
    prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

    const request = new Request(`http://localhost/api/${storeId}/overview/total-revenue`);
    const response = await GET(request, { params: { storeId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    // Calculation based on original logic: (100+50) + 200 = 350
    expect(data.totalRevenue).toBe(350); 
    expect(prismaMock.store.findFirst).toHaveBeenCalledWith({ where: { id: storeId, userId: 'single-user' } });
    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { storeId, isPaid: true },
      include: { orderItems: { include: { product: true } } },
    });
  });

  it('should return 0 revenue if no paid orders are found', async () => {
    prismaMock.store.findFirst.mockResolvedValue({ id: storeId, userId: 'single-user' } as any);
    prismaMock.order.findMany.mockResolvedValue([]); // No orders

    const request = new Request(`http://localhost/api/${storeId}/overview/total-revenue`);
    const response = await GET(request, { params: { storeId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalRevenue).toBe(0);
  });

  it('should return 401 if user is not authenticated', async () => {
    authMock.mockResolvedValue(false); // Simulate unauthenticated user

    const request = new Request(`http://localhost/api/${storeId}/overview/total-revenue`);
    const response = await GET(request, { params: { storeId } });
    
    expect(response.status).toBe(401);
    const text = await response.text();
    expect(text).toBe("Unauthenticated");
  });

  it('should return 400 if storeId is not provided (though URL structure usually prevents this)', async () => {
    // This case is mostly for type safety / completeness, as Next.js routing handles param presence.
    const request = new Request(`http://localhost/api//overview/total-revenue`); // No storeId
    // @ts-ignore // Simulating missing params for test
    const response = await GET(request, { params: {} }); 
    expect(response.status).toBe(400);
  });
  
  it('should return 403 if store is not found for the user', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null); // Store not found or not owned by user

    const request = new Request(`http://localhost/api/${storeId}/overview/total-revenue`);
    const response = await GET(request, { params: { storeId } });

    expect(response.status).toBe(403);
    const text = await response.text();
    expect(text).toBe("Unauthorized to access this store");
  });

  it('should return 500 if there is an internal server error', async () => {
    prismaMock.store.findFirst.mockRejectedValue(new Error('Database error')); // Simulate DB error

    const request = new Request(`http://localhost/api/${storeId}/overview/total-revenue`);
    const response = await GET(request, { params: { storeId } });

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe("Internal error");
  });
});
