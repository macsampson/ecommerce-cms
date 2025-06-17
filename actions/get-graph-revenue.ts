import prismadb from '@/lib/prismadb'

interface GraphData {
  name: string
  total: number
}

export const getGraphRevenue = async (storeId: string, year?: number) => {
  // Build date range if year is provided
  let dateFilter = {}
  if (year) {
    dateFilter = {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      ...(year && { createdAt: dateFilter })
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })

  const monthlyRevenue: { [key: number]: number } = {}

  for (const order of paidOrders) {
    const month = new Date(order.createdAt).getMonth()
    if (!monthlyRevenue[month]) monthlyRevenue[month] = 0

    for (const orderItem of order.orderItems) {
      monthlyRevenue[month] += orderItem.product.price.toNumber()
    }
  }

  const graphData: GraphData[] = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 }
  ]

  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)]
  }

  return graphData
}

export const getOrderYears = async (storeId: string): Promise<number[]> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    select: {
      createdAt: true
    }
  })

  // Extract years from createdAt
  const yearsSet = new Set<number>()
  for (const order of paidOrders) {
    yearsSet.add(order.createdAt.getFullYear())
  }
  // Return sorted years, most recent first
  return Array.from(yearsSet).sort((a, b) => b - a)
}
