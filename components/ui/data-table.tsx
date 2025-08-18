'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useParams } from 'next/navigation'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'quantity',
      desc: true
    }
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<TData | null>(null)

  const router = useRouter()
  const params = useParams()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting
    }
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="w-full max-w-xs sm:max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => {
                  const headerClass =
                    (header.column.columnDef as any).headerClassName ||
                    (i > 1 ? 'hidden md:table-cell' : '')
                  return (
                    <TableHead key={header.id} className={headerClass}>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler()
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
                <TableHead className="md:hidden">Details</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const original: any = row.original
                const isProductRow = original && original.id && original.name
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={isProductRow ? 'cursor-pointer' : ''}
                    onClick={
                      isProductRow
                        ? () =>
                            router.push(
                              `/${params.storeId}/products/${original.id}`
                            )
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell, i) => {
                      const cellClass =
                        (cell.column.columnDef as any).cellClassName ||
                        (i > 1 ? 'hidden md:table-cell' : '')
                      return (
                        <TableCell key={cell.id} className={cellClass}>
                          <div
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('button')) {
                                e.stopPropagation()
                              }
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                    <TableCell className="md:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setModalData(row.original)
                          setModalOpen(true)
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Details"
        description="Full row details"
      >
        <div className="space-y-2">
          {modalData &&
            Object.entries(modalData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-semibold">{key}</span>
                <span className="break-all text-right">{String(value)}</span>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  )
}
