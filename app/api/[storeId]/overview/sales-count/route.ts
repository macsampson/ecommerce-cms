import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Optional: Check if the user has access to this store
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!store) {
      return new NextResponse("Unauthorized to access this store", { status: 403 });
    }

    const salesCount = await prismadb.order.count({
      where: {
        storeId: params.storeId,
        isPaid: true,
      },
    });
    
    return NextResponse.json({ salesCount });

  } catch (error) {
    console.error('[SALES_COUNT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
