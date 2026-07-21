import prismadb from '@/lib/prismadb'

export const LOW_STOCK_THRESHOLD = 5
export const CRITICAL_STOCK_THRESHOLD = 2

export type LowStockProduct = {
  id: string
  name: string
  quantity: number
  color: string | null
  size: string | null
}

export const getLowStockProducts = async (
  storeId: string
): Promise<LowStockProduct[]> => {
  const products = await prismadb.product.findMany({
    where: {
      storeId,
      isArchived: false,
      quantity: {
        lte: LOW_STOCK_THRESHOLD
      }
    },
    include: {
      color: true,
      size: true
    },
    orderBy: {
      quantity: 'asc'
    },
    take: 6
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    color: product.color?.name ?? null,
    size: product.size?.name ?? null
  }))
}
