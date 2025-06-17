'use client'

import { ColumnDef, Column } from '@tanstack/react-table' // Import Column
import { CellAction } from './cell-action' // Import CellAction
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Definition for renderSortableHeader (copied from products)
const renderSortableHeader = <TData, TValue>(
  column: Column<TData, TValue>,
  title: string
) => {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === 'asc')}
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
  )
}

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
  phoneNumber: string
  customerName: string
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => renderSortableHeader(column, 'Order ID')
  },
  {
    accessorKey: 'emailAddress',
    header: ({ column }) => renderSortableHeader(column, 'Email')
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => renderSortableHeader(column, 'Total Price')
  },
  // All other columns hidden on mobile
  {
    accessorKey: 'products',
    header: 'Products'
  },
  {
    accessorKey: 'shippingAddress',
    header: 'Shipping Address'
  },
  {
    accessorKey: 'address',
    header: 'Billing Address'
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => renderSortableHeader(column, 'Phone Number')
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => renderSortableHeader(column, 'Customer Name')
  },
  {
    accessorKey: 'isPaid',
    header: ({ column }) => renderSortableHeader(column, 'Paid'),
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-x-2">
          {row.original.isPaid ? '💵' : '❌'}
        </div>
      )
    }
  },
  {
    accessorKey: 'isAbandoned',
    header: ({ column }) => renderSortableHeader(column, 'Abandoned'),
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-x-2">
          {row.original.isAbandoned ? '🗑️' : '🛒'}
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, 'Date Created')
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
