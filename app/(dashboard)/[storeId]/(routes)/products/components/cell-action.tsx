'use client'

import { Copy, Edit, MoreHorizontal } from 'lucide-react' // Removed Trash
import { toast } from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
// import { useState } from 'react' // Removed useState
// import axios from 'axios' // Removed axios

import { ProductColumn } from './columns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
// import { AlertModal } from '@/components/modals/alert-modal' // Removed AlertModal

interface CellActionProps {
  data: ProductColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  // const [loading, setLoading] = useState(false) // Removed loading state
  // const [open, setOpen] = useState(false) // Removed open state

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Product ID copied to clipboard.')
  }

  // Removed onDelete function

  // The original component only had a direct delete button,
  // not a DropdownMenu with a delete item.
  // If there was a DropdownMenu, the structure would be like this:
  // return (
  //   <>
  //     {/* <AlertModal ... /> */}
  //     <DropdownMenu>
  //       <DropdownMenuTrigger asChild>
  //         <Button variant="ghost" className="h-8 w-8 p-0">
  //           <span className="sr-only">Open menu</span>
  //           <MoreHorizontal className="h-4 w-4" />
  //         </Button>
  //       </DropdownMenuTrigger>
  //       <DropdownMenuContent align="end">
  //         <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //         <DropdownMenuItem onClick={() => onCopy(data.id)}>
  //           <Copy className="mr-2 h-4 w-4" />
  //           Copy ID
  //         </DropdownMenuItem>
  //         <DropdownMenuItem
  //           onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
  //         >
  //           <Edit className="mr-2 h-4 w-4" />
  //           Update
  //         </DropdownMenuItem>
  //         {/* <DropdownMenuItem onClick={() => setOpen(true)}> // This would be removed
  //           <Trash className="mr-2 h-4 w-4" />
  //           Delete
  //         </DropdownMenuItem> */}
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   </>
  // )

  // Since the original only had a delete button, and we are removing it,
  // this component might become empty or only have other actions.
  // For now, let's assume other actions like "Copy ID" and "Update" might be desired in a DropdownMenu.
  // If no actions are left, this component might need to be removed entirely from columns.tsx.
  // Based on the provided code, only a Delete button was present.
  // If other actions were intended, they were not in the snippet.
  // For this exercise, I will leave the component potentially empty or ready for other actions.
  // If the only button was delete, this component will render nothing.
  // Let's add the copy and edit actions as they are typical for a cell action component.

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onCopy(data.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
