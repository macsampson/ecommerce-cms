"use client"

import * as z from "zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Size } from "@prisma/client"

import { Modal } from "@/components/ui/modal"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
})

type FormValues = z.infer<typeof formSchema>

interface QuickCreateSizeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (size: Size) => void
}

export const QuickCreateSizeModal: React.FC<QuickCreateSizeModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", value: "" },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const response = await axios.post(`/api/${params.storeId}/sizes`, data)
      toast.success("Size created.")
      onCreated(response.data)
      form.reset()
      onClose()
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create Size"
      description="Add a new size for your products."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Small" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="S" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-2 space-x-2 flex items-center justify-end">
            <Button
              type="button"
              disabled={loading}
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  )
}
