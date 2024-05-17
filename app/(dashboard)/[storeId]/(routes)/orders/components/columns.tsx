'use client'

import { ColumnDef } from '@tanstack/react-table'
// import { CellAction } from "./cell-action"

export type OrderColumn = {
  id: string
  emailAddress: string
  address: string
  isPaid: boolean
  totalPrice: string
  products: string
  createdAt: string
  shippingAddress: string
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
  },
  {
    accessorKey: 'products',
    header: 'Products',
  },
  {
    accessorKey: 'shippingAddress',
    header: 'Shipping Address',
  },

  {
    accessorKey: 'address',
    header: 'Billing Address',
  },
  {
    accessorKey: 'emailAddress',
    header: 'Email',
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total Price',
  },
  {
    accessorKey: 'isPaid',
    header: 'Paid',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          {row.original.isPaid ? '🟢' : '🔴'}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Created',
  },
]
