"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type BillboardColumn = {
  id: string
  label: string
  landingPage: boolean
  createdAt: string
}

export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
  },
  {
    accessorKey: "landingPage",
    header: "Landing Page",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.landingPage ? "Active" : ""}
      </div>
    ),
  },
  {
    id: "action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
