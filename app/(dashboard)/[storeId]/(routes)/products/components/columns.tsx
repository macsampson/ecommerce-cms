'use client'

import { ColumnDef } from '@tanstack/react-table'
// import { CellAction } from './cell-action' // Removed as it's no longer used
import Image from 'next/image'

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
  imageUrl?: string | null
}

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react' // Import ArrowUp and ArrowDown
import { Button } from '@/components/ui/button'
import { Column } from '@tanstack/react-table' // Import Column type

// Helper function to render sortable header
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

export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: 'image',
    header: 'Image',
    cell: ({ row }) =>
      row.original.imageUrl ? (
        <Image
          src={row.original.imageUrl}
          alt={row.original.name}
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded-md border"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-muted text-muted-foreground rounded-md border">
          N/A
        </div>
      ),
    enableSorting: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => renderSortableHeader(column, 'Name'),
    enableSorting: true,
    cell: ({ row }) => {
      const router = require('next/navigation').useRouter()
      const params = require('next/navigation').useParams()
      return (
        <button
          className="text-primary underline hover:text-primary/80 text-left w-full"
          onClick={() =>
            router.push(`/${params.storeId}/products/${row.original.id}`)
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
    accessorKey: 'price',
    header: ({ column }) => renderSortableHeader(column, 'Price'),
    enableSorting: true
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => renderSortableHeader(column, 'Quantity'),
    enableSorting: true
  },
  {
    accessorKey: 'category',
    header: ({ column }) => renderSortableHeader(column, 'Category'),
    enableSorting: true
  },
  {
    accessorKey: 'isFeatured',
    header: ({ column }) => renderSortableHeader(column, 'Featured'),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isFeatured ? '🟢' : '🔴'}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.size || 'N/A'}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color ? (
          <div className="flex items-center gap-x-1">
            <div
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: row.original.color }}
            />
          </div>
        ) : (
          'N/A'
        )}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'isArchived',
    header: ({ column }) => renderSortableHeader(column, 'Live'),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isArchived ? '🔴' : '🟢'}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, 'Date Created'),
    enableSorting: true
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => renderSortableHeader(column, 'Last Updated'),
    enableSorting: true
  }
  // Removed Action Column:
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
]
