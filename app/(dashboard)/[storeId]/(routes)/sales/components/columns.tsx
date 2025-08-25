"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"

export type SaleColumn = {
  id: string
  name: string
  percentage: string
  startDate: string
  endDate: string
  isActive: boolean
  isStoreWide: boolean
  productCount: number
  createdAt: string
}

export const columns: ColumnDef<SaleColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const router = require('next/navigation').useRouter()
      const params = require('next/navigation').useParams()
      return (
        <button
          className="text-primary underline hover:text-primary/80 text-left w-full"
          onClick={() =>
            router.push(`/${params.storeId}/sales/${row.original.id}`)
          }
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          {row.original.name}
        </button>
      )
    }
  },
  {
    accessorKey: "percentage",
    header: "Discount",
    cell: ({ row }) => `${row.original.percentage}%`,
  },
  {
    accessorKey: "scope",
    header: "Scope",
    cell: ({ row }) => (
      <Badge variant={row.original.isStoreWide ? "default" : "secondary"}>
        {row.original.isStoreWide ? "Store-wide" : `${row.original.productCount} products`}
      </Badge>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]