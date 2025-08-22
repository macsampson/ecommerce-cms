import prismadb from "@/lib/prismadb"
import { SaleForm } from "./components/sale-form"

const SalePage = async ({
  params
}: {
  params: { saleId: string; storeId: string }
}) => {
  const sale = await prismadb.sale.findUnique({
    where: {
      id: params.saleId,
      storeId: params.storeId,
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: true,
              category: true
            }
          }
        }
      }
    }
  })

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false
    },
    include: {
      images: true,
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SaleForm initialData={sale} products={products} />
      </div>
    </div>
  )
}

export default SalePage