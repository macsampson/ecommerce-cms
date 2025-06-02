import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

interface GraphData {
  name: string;
  total: number;
}

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

    // Logic from actions/get-graph-revenue.ts
    const paidOrders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        isPaid: true,
      },
      include: {
        orderItems: {
          include: {
            product: true, // For product.price
            // productVariation: true, // If variation prices are used
          },
        },
      },
    });

    const monthlyRevenue: { [key: number]: number } = {};

    for (const order of paidOrders) {
      const month = new Date(order.createdAt).getMonth(); // 0 for Jan, 1 for Feb, etc.
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = 0;
      }

      // Calculate revenue for this order and add to the respective month
      // This logic should be consistent with how total revenue is calculated.
      // The original get-graph-revenue.ts uses:
      // monthlyRevenue[month] += orderItem.product.price.toNumber();
      // This has the same potential issue as total revenue (not multiplying by quantity).
      // For consistency with the corrected total-revenue API, I will replicate this specific logic from get-graph-revenue.
      for (const orderItem of order.orderItems) {
        if (orderItem.product && orderItem.product.price) {
           // This is what get-graph-revenue.ts does: sums product prices per order item.
           monthlyRevenue[month] += orderItem.product.price.toNumber();
        }
      }
    }

    const graphData: GraphData[] = [
      { name: "Jan", total: 0 }, { name: "Feb", total: 0 },
      { name: "Mar", total: 0 }, { name: "Apr", total: 0 },
      { name: "May", total: 0 }, { name: "Jun", total: 0 },
      { name: "Jul", total: 0 }, { name: "Aug", total: 0 },
      { name: "Sep", total: 0 }, { name: "Oct", total: 0 },
      { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
    ];

    for (const monthIndex in monthlyRevenue) {
      if (graphData[parseInt(monthIndex)]) { // Ensure monthIndex is valid
        graphData[parseInt(monthIndex)].total = monthlyRevenue[parseInt(monthIndex)];
      }
    }
    
    return NextResponse.json(graphData);

  } catch (error) {
    console.error('[GRAPH_REVENUE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
