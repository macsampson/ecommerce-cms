'use client'

import { PlusIcon, PackageSearch } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ProductColumn, columns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import { getStockRowStyle } from '@/components/stock-gauge'

interface ProductClientProps {
  data: ProductColumn[]
}

export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
        <Heading
          title={`Inventory (${data.length})`}
          description="Stock levels across every SKU — the fill behind each row tracks against reorder threshold"
        />
        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add product
        </Button>
      </div>
      <Separator />
      <div className="w-full">
        <DataTable
          columns={columns}
          data={data}
          searchKey="name"
          searchPlaceholder="Search products…"
          getRowStyle={(row) => getStockRowStyle(row.quantity)}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-6">
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Nothing on the shelves yet.</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add your first product to start tracking stock and taking
                orders.
              </p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => router.push(`/${params.storeId}/products/new`)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add product
              </Button>
            </div>
          }
        />
      </div>
    </>
  )
}
