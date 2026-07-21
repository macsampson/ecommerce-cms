'use client'

import { ColumnDef, Column } from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderStatusPipeline } from '@/components/order-status-pipeline'

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

type Col = ColumnDef<OrderColumn> & {
  cellClassName?: string
  headerClassName?: string
}

export const columns: Col[] = [
  {
    accessorKey: 'customerName',
    header: ({ column }) => renderSortableHeader(column, 'Customer'),
    cellClassName: 'table-cell',
    headerClassName: 'table-cell',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.customerName || 'Guest'}</p>
        <p className="text-xs text-muted-foreground font-data">
          {row.original.id.slice(0, 8)}
        </p>
      </div>
    )
  },
  {
    id: 'stage',
    header: 'Status',
    cellClassName: 'table-cell',
    headerClassName: 'table-cell',
    cell: ({ row }) => (
      <OrderStatusPipeline
        isPaid={row.original.isPaid}
        isAbandoned={row.original.isAbandoned}
        size="sm"
      />
    )
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => renderSortableHeader(column, 'Total'),
    cellClassName: 'table-cell',
    headerClassName: 'table-cell',
    cell: ({ row }) => (
      <span className="font-data tabular-nums">
        {row.original.totalPrice}
      </span>
    )
  },
  {
    accessorKey: 'emailAddress',
    header: ({ column }) => renderSortableHeader(column, 'Email')
  },
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => (
      <span className="whitespace-pre-line text-xs">
        {row.original.products}
      </span>
    )
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
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, 'Date Created'),
    cell: ({ row }) => (
      <span className="font-data text-xs">{row.original.createdAt}</span>
    )
  }
]
