"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type ProductColumn = {
  id: string
  name: string
  price: string
  quantity: number
  size: string | undefined
  category: string
  color: string | undefined
  isFeatured: boolean
  isArchived: boolean
  createdAt: string
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.isFeatured ? "🟢" : "🔴"}
      </div>
    ),
  },
  // {
  //   accessorKey: "size",
  //   header: "Size",
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-x-2">
  //       {row.original.size ? row.original.size : "n/a"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "color",
  //   header: "Color",
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-x-2">
  //       {row.original.color ? (
  //         <div
  //           className="w-6 h-6 rounded-full border"
  //           style={{ backgroundColor: row.original.color }}
  //         />
  //       ) : (
  //         "n/a"
  //       )}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "isArchived",
    header: "Live",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.isArchived ? "🔴" : "🟢"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
  },
  {
    id: "action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
