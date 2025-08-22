"use client"

import { PlusIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { SaleColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/ui/api-list"

interface SaleClientProps {
  data: SaleColumn[]
}

export const SaleClient: React.FC<SaleClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Sales (${data.length})`}
          description="Manage your sales and discounts"
        />

        <Button
          onClick={() => router.push(`/${params.storeId}/sales/new`)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
      />
      <Heading
        title="API"
        description="API calls for Sales"
      />
      <Separator />
      <ApiList
        entityName="sales"
        entityIdName="saleId"
      />
    </>
  )
}