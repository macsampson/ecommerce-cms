'use client'

import { ColumnDef, Column } from '@tanstack/react-table' // Import Column
import { CellAction } from "./cell-action" // Import CellAction
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Definition for renderSortableHeader (copied from products)
const renderSortableHeader = <TData, TValue>(column: Column<TData, TValue>, title: string) => {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : sorted === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

export type OrderColumn = {
  id: string
  emailAddress: string
  address: string // Billing address
  isPaid: boolean
  isAbandoned: boolean
  totalPrice: string
  products: string // This is a formatted string of products and their variations/quantities
  createdAt: string
  shippingAddress: string
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => renderSortableHeader(column, "Order ID"),
  },
  {
    accessorKey: 'products',
    header: 'Products', // Not making this sortable due to its complex string nature
    // cell: ({ row }) => <div className="whitespace-pre-wrap">{row.original.products}</div> // Already handled by parent div
  },
  {
    accessorKey: 'shippingAddress',
    header: 'Shipping Address', // Not making this sortable
  },
  {
    accessorKey: 'address',
    header: 'Billing Address', // Not making this sortable
  },
  {
    accessorKey: 'emailAddress',
    header: ({ column }) => renderSortableHeader(column, "Email"),
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => renderSortableHeader(column, "Total Price"),
  },
  {
    accessorKey: 'isPaid',
    header: ({ column }) => renderSortableHeader(column, "Paid"),
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-x-2"> {/* Centered */}
          {row.original.isPaid ? '💵' : '❌'}
        </div>
      )
    }
  },
  {
    accessorKey: 'isAbandoned',
    header: ({ column }) => renderSortableHeader(column, "Abandoned"),
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-x-2"> {/* Centered */}
          {row.original.isAbandoned ? '🗑️' : '🛒'}
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, "Date Created"),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
