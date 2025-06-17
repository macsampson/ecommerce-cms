'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatter } from '@/lib/utils'
// import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Example icons
// import { Button } from "@/components/ui/button"; // Example button for actions
// import { Checkbox } from "@/components/ui/checkbox"; // Example checkbox for row selection

// This type can be expanded later with more customer details
export type CustomerColumn = {
  id: string
  name: string
  email: string
  phone?: string // Optional phone number
  totalOrders: number
  totalSpent: number // Could be a formatted string or number
}

export const columns: ColumnDef<CustomerColumn>[] = [
  // If using row selection
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  // All other columns hidden on mobile
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'totalOrders',
    header: 'Total Orders'
  },
  {
    accessorKey: 'totalSpent',
    header: 'Total Spent',
    cell: ({ row }) => formatter.format(row.original.totalSpent)
  }
  // Example for an actions column:
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const customer = row.original;
  //     return (
  //       // DropdownMenu, Buttons, etc. for actions like Edit, Delete, View Details
  //       <p>Actions</p>
  //     );
  //   },
  // },
]
