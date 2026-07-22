"use client"

import * as z from "zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Billboard, Category } from "@prisma/client"
import Link from "next/link"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1),
})

type FormValues = z.infer<typeof formSchema>

interface QuickCreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  billboards: Billboard[]
  onCreated: (category: Category) => void
}

export const QuickCreateCategoryModal: React.FC<
  QuickCreateCategoryModalProps
> = ({ isOpen, onClose, billboards, onCreated }) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", billboardId: "" },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const response = await axios.post(
        `/api/${params.storeId}/categories`,
        data
      )
      toast.success("Category created.")
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
      title="Create Category"
      description="Add a new category for your products."
      isOpen={isOpen}
      onClose={handleClose}
    >
      {billboards.length === 0 ? (
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Categories need a billboard first. Create one, then come back here.
          </p>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button asChild>
              <Link href={`/${params.storeId}/billboards/new`}>
                Create a billboard
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Shirts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      )}
    </Modal>
  )
}
