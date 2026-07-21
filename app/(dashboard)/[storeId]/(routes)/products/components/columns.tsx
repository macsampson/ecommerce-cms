'use client'

import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

import { ArrowUpDown, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { StockLevelBadge } from '@/components/stock-gauge'

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

const ProductNameCell = ({ row }: { row: { original: ProductColumn } }) => {
  const router = useRouter()
  const params = useParams()
  return (
    <button
      className="text-left w-full font-medium hover:text-primary transition-colors"
      onClick={() =>
        router.push(`/${params.storeId}/products/${row.original.id}`)
      }
    >
      {row.original.name}
    </button>
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
          width={44}
          height={44}
          className="w-11 h-11 object-cover rounded-md border border-border"
        />
      ) : (
        <div className="w-11 h-11 flex items-center justify-center bg-muted text-muted-foreground text-[10px] rounded-md border border-border">
          No image
        </div>
      ),
    enableSorting: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => renderSortableHeader(column, 'Name'),
    enableSorting: true,
    cell: ({ row }) => <ProductNameCell row={row} />
  },
  {
    accessorKey: 'price',
    header: ({ column }) => renderSortableHeader(column, 'Price'),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-data tabular-nums">{row.original.price}</span>
    )
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => renderSortableHeader(column, 'Stock'),
    enableSorting: true,
    cell: ({ row }) => <StockLevelBadge quantity={row.original.quantity} />
  },
  {
    accessorKey: 'category',
    header: ({ column }) => renderSortableHeader(column, 'Category'),
    enableSorting: true
  },
  {
    accessorKey: 'isFeatured',
    header: ({ column }) => renderSortableHeader(column, 'Featured'),
    cell: ({ row }) =>
      row.original.isFeatured ? (
        <Star className="h-4 w-4 fill-amber text-amber" />
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
    enableSorting: true
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.size || '—'}
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
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: row.original.color }}
          />
        ) : (
          '—'
        )}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'isArchived',
    header: ({ column }) => renderSortableHeader(column, 'Status'),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          row.original.isArchived
            ? 'border-border text-muted-foreground'
            : 'border-teal/40 bg-teal/10 text-teal'
        )}
      >
        {row.original.isArchived ? 'Archived' : 'Live'}
      </Badge>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => renderSortableHeader(column, 'Date Created'),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-data text-xs">{row.original.createdAt}</span>
    )
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => renderSortableHeader(column, 'Last Updated'),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-data text-xs">{row.original.updatedAt}</span>
    )
  }
]
