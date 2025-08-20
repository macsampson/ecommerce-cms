import { GET } from './route'; // Adjust path as necessary
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { isAuthenticated } from '@/lib/auth';
import { PrismaClient, Product, Category, Size, Color } from '@prisma/client'; // For typing the mock
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { format } from 'date-fns';
import { formatter } from '@/lib/utils'; // Actual formatter will be used

// Mock the auth module
jest.mock('@/lib/auth');

// Explicitly type the mock for prismadb
const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;
// Explicitly type the mock for auth
const authMock = isAuthenticated as jest.Mock;

describe('GET /api/[storeId]/products-summary', () => {
  const storeId = 'test-store-id';
  const mockUserId = 'mock-user-id';
  const dateNow = new Date();

  const mockProducts: (Product & { category: Category; size: Size | null; color: Color | null; })[] = [
    {
      id: 'prod1',
      name: 'Product 1',
      price: { toNumber: () => 19.99 } as any, // Prisma Decimal mock
      quantity: 10,
      isFeatured: true,
      isArchived: false,
      storeId: storeId,
      categoryId: 'cat1',
      sizeId: 'size1',
      colorId: 'color1',
      createdAt: dateNow,
      updatedAt: dateNow,
      category: { id: 'cat1', storeId: storeId, billboardId: 'bill1', name: 'Category 1', createdAt: dateNow, updatedAt: dateNow },
      size: { id: 'size1', storeId: storeId, name: 'Small', value: 'S', createdAt: dateNow, updatedAt: dateNow },
      color: { id: 'color1', storeId: storeId, name: 'Red', value: '#FF0000', createdAt: dateNow, updatedAt: dateNow },
    },
    {
      id: 'prod2',
      name: 'Product 2',
      price: { toNumber: () => 29.99 } as any,
      quantity: 5,
      isFeatured: false,
      isArchived: false,
      storeId: storeId,
      categoryId: 'cat2',
      sizeId: null,
      colorId: null,
      createdAt: dateNow,
      updatedAt: dateNow,
      category: { id: 'cat2', storeId: storeId, billboardId: 'bill2', name: 'Category 2', createdAt: dateNow, updatedAt: dateNow },
      size: null,
      color: null,
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    authMock.mockResolvedValue(true);
  });

  it('should return formatted products when authenticated and store found', async () => {
    prismaMock.store.findFirst.mockResolvedValue({ id: storeId, userId: 'single-user' } as any);
    prismaMock.product.findMany.mockResolvedValue(mockProducts);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: { storeId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      id: 'prod1',
      name: 'Product 1',
      price: formatter.format(19.99),
      quantity: 10,
      category: 'Category 1',
      size: 'Small',
      color: '#FF0000',
      isFeatured: true,
      isArchived: false,
      createdAt: format(dateNow, 'MMMM do, yyyy'),
      updatedAt: format(dateNow, 'MMMM do, yyyy'),
    });
    expect(data[1]).toEqual({
      id: 'prod2',
      name: 'Product 2',
      price: formatter.format(29.99),
      quantity: 5,
      category: 'Category 2',
      size: undefined, // because product.size is null
      color: undefined, // because product.color is null
      isFeatured: false,
      isArchived: false,
      createdAt: format(dateNow, 'MMMM do, yyyy'),
      updatedAt: format(dateNow, 'MMMM do, yyyy'),
    });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { storeId },
      include: { category: true, size: true, color: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return an empty array if no products are found', async () => {
    prismaMock.store.findFirst.mockResolvedValue({ id: storeId, userId: 'single-user' } as any);
    prismaMock.product.findMany.mockResolvedValue([]);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: { storeId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
  
  it('should return 401 if user is not authenticated', async () => {
    authMock.mockResolvedValue(false);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: { storeId } });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 403 if store is not found for the user', async () => {
    prismaMock.store.findFirst.mockResolvedValue(null);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: { storeId } });

    expect(response.status).toBe(403);
  });

  it('should return 500 if there is an internal server error', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('Database error'));
     prismaMock.store.findFirst.mockResolvedValue({ id: storeId, userId: 'single-user' } as any);


    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: { storeId } });

    expect(response.status).toBe(500);
  });
});
