'use client'


import { Copy, Edit, MoreHorizontal } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
// import { useState } from 'react'
// import axios from 'axios'

import { ProductColumn } from './columns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// import { AlertModal } from '@/components/modals/alert-modal'


interface CellActionProps {
  data: ProductColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()


  // const [loading, setLoading] = useState(false)
  // const [open, setOpen] = useState(false)


  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Product ID copied to clipboard.')
  }

  // const onDelete = async () => {
  //   try {
  //     setLoading(true)
  //     await axios.delete(`/api/${params.storeId}/products/${data.id}`)
  //     router.refresh()
  //     toast.success('Product deleted.')
  //   } catch (error) {
  //     toast.error('Something went wrong.')
  //   } finally {
  //     setLoading(false)
  //     setOpen(false)
  //   }
  // }


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

          onClick={() =>
            router.push(`/${params.storeId}/products/${data.id}`)
          }

        >
          <Edit className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
