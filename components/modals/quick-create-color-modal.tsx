"use client"

import * as z from "zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Color } from "@prisma/client"

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
  value: z
    .string()
    .min(4)
    .regex(/^#/, { message: "String must be a valid hex color code." }),
})

type FormValues = z.infer<typeof formSchema>

interface QuickCreateColorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (color: Color) => void
}

export const QuickCreateColorModal: React.FC<QuickCreateColorModalProps> = ({
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
      const response = await axios.post(`/api/${params.storeId}/colors`, data)
      toast.success("Color created.")
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
      title="Create Color"
      description="Add a new color for your products."
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
                  <Input disabled={loading} placeholder="Red" {...field} />
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
                  <div className="flex items-center gap-x-4">
                    <Input disabled={loading} placeholder="#FF0000" {...field} />
                    <div
                      className="border p-4 rounded-full"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
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
