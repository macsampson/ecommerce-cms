'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'

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
  updatedAt: string
}

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react" // Import ArrowUp and ArrowDown
import { Button } from "@/components/ui/button"
import { Column } from "@tanstack/react-table" // Import Column type

// Helper function to render sortable header
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

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => renderSortableHeader(column, "Name"),
    enableSorting: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => renderSortableHeader(column, "Price"),
    enableSorting: true,
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => renderSortableHeader(column, "Quantity"),
    enableSorting: true,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => renderSortableHeader(column, "Category"),
    enableSorting: true,
  },
  {
    accessorKey: 'isFeatured',
    header: ({ column }) => renderSortableHeader(column, "Featured"),
    cell: ({ row }) => (
      <div className="flex items-center justify-center"> {/* Centered content */}
        {row.original.isFeatured ? '🟢' : '🔴'}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.size || "N/A"} {/* Provide fallback for undefined/empty size */}
      </div>
    ),
    enableSorting: false, // Size might not be ideal for sorting unless it's standardized
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color ? (
          <div className="flex items-center gap-x-1">
            <div
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: row.original.color }}
            />
            {/* Optional: Display hex code or color name if available and distinct from the visual color */}
            {/* <span>{row.original.color}</span> */}
          </div>
        ) : (
          "N/A" // Provide fallback for undefined/empty color
        )}
      </div>
    ),
    enableSorting: false, // Color value might not be ideal for sorting
  },
  {
    accessorKey: 'isArchived',
    header: ({ column }) => renderSortableHeader(column, "Live"),
    cell: ({ row }) => (
      <div className="flex items-center justify-center"> {/* Centered content */}
        {row.original.isArchived ? '🔴' : '🟢'}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, "Date Created"),
    enableSorting: true,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => renderSortableHeader(column, "Last Updated"),
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
