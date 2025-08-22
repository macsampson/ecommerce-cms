import { format } from "date-fns"
import prismadb from "@/lib/prismadb"
import { SaleClient } from "./components/client"
import { SaleColumn } from "./components/columns"

const SalesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const sales = await prismadb.sale.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      products: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedSales: SaleColumn[] = sales.map((item) => ({
    id: item.id,
    name: item.name,
    percentage: item.percentage.toString(),
    startDate: format(item.startDate, 'MMMM do, yyyy'),
    endDate: format(item.endDate, 'MMMM do, yyyy'),
    isActive: item.isActive,
    isStoreWide: item.isStoreWide,
    productCount: item.products.length,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SaleClient data={formattedSales} />
      </div>
    </div>
  )
}

export default SalesPage