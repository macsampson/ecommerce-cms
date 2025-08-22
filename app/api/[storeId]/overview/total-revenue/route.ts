import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request, // req is not used but is part of the signature
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      }
    });

    if (!store) {
      return new NextResponse("Unauthorized to access this store", { status: 403 });
    }

    const paidOrders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        isPaid: true,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Strictly replicating the logic from actions/get-total-revenue.ts
    const totalRevenue = paidOrders.reduce((total, order) => {
      const orderTotal = order.orderItems.reduce((currentOrderSum, orderItem) => {
        // Assuming orderItem.product is always present and has a valid price
        // This adds the product's price for each orderItem entry.
        // If an orderItem itself represents a line item with a quantity > 1,
        // this logic still only adds the product's unit price once for that line item.
        // Example: If OrderItem is { product: { price: 10 }, quantity: 3 }, this adds 10, not 30.
        // This matches the provided get-total-revenue.ts.
        if (orderItem.product && orderItem.product.priceInCents) {
          return currentOrderSum + (orderItem.product.priceInCents / 100);
        }
        return currentOrderSum;
      }, 0);
      return total + orderTotal;
    }, 0);
    
    return NextResponse.json({ totalRevenue });

  } catch (error) {
    console.error('[TOTAL_REVENUE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
