"use client";

import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Example icons
// import { Button } from "@/components/ui/button"; // Example button for actions
// import { Checkbox } from "@/components/ui/checkbox"; // Example checkbox for row selection

// This type can be expanded later with more customer details
export type CustomerColumn = {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional phone number
  totalOrders: number;
  totalSpent: number; // Could be a formatted string or number
};

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
    accessorKey: "name",
    header: "Name",
    // Example of a more complex header with sorting:
    // header: ({ column }) => {
    //   return (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Name
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   )
    // },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
    // You might want to right-align numeric values
    // cell: ({ row }) => <div className="text-right">{row.original.totalOrders}</div>
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    // Example for formatting currency, assuming totalSpent is a number
    // cell: ({ row }) => {
    //   const amount = parseFloat(row.getValue("totalSpent"))
    //   const formatted = new Intl.NumberFormat("en-US", {
    //     style: "currency",
    //     currency: "USD", // Change as needed
    //   }).format(amount)
    //   return <div className="text-right font-medium">{formatted}</div>
    // }
  },
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
];
