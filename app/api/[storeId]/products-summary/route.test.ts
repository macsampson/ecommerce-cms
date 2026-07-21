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

  const mockProducts: (Product & { category: Category; size: Size | null; color: Color | null; images: { id: string; url: string; ordering: number }[] })[] = [
    {
      id: 'prod1',
      name: 'Product 1',
      priceInCents: 1999,
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
      images: [{ id: 'img1', url: 'https://example.com/prod1.png', ordering: 0 }],
    },
    {
      id: 'prod2',
      name: 'Product 2',
      priceInCents: 2999,
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
      images: [],
    },
  ] as any;

  beforeEach(() => {
    jest.resetAllMocks();
    authMock.mockResolvedValue(true);
  });

  it('should return formatted products when authenticated', async () => {
    prismaMock.product.findMany.mockResolvedValue(mockProducts);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: Promise.resolve({ storeId }) });
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
      imageUrl: 'https://example.com/prod1.png',
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
      imageUrl: null,
    });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { storeId },
      include: { category: true, size: true, color: true, images: { orderBy: { ordering: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return an empty array if no products are found', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: Promise.resolve({ storeId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
  
  it('should return 401 if user is not authenticated', async () => {
    authMock.mockResolvedValue(false);

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: Promise.resolve({ storeId }) });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 500 if there is an internal server error', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('Database error'));

    const request = new Request(`http://localhost/api/${storeId}/products-summary`);
    const response = await GET(request, { params: Promise.resolve({ storeId }) });

    expect(response.status).toBe(500);
  });
});
