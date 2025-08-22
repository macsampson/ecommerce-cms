"use client"

import * as z from "zod"
import { Sale, SaleProduct, Product, Image, Category } from "@prisma/client"
import { Trash, CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import NextImage from "next/image"

import { Input } from "@/components/ui/input"
import { AlertModal } from "@/components/modals/alert-modal"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type SaleWithProducts = Sale & {
  products: (SaleProduct & {
    product: Product & {
      images: Image[]
      category: Category
    }
  })[]
}

type ProductWithDetails = Product & {
  images: Image[]
  category: Category
}

interface SaleFormProps {
  initialData: SaleWithProducts | null
  products: ProductWithDetails[]
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  percentage: z.number().min(0).max(100),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
  isStoreWide: z.boolean().default(false),
  productIds: z.array(z.string()).optional(),
}).refine((data) => data.startDate < data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"],
})

type SaleFormValues = z.infer<typeof formSchema>

export const SaleForm: React.FC<SaleFormProps> = ({
  initialData,
  products,
}) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? "Edit sale" : "Create sale"
  const description = initialData ? "Edit a sale" : "Add a new sale"
  const toastMessage = initialData ? "Sale updated." : "Sale created."
  const action = initialData ? "Save changes" : "Create"

  const defaultValues = initialData ? {
    name: initialData.name,
    description: initialData.description || "",
    percentage: Number(initialData.percentage),
    startDate: new Date(initialData.startDate),
    endDate: new Date(initialData.endDate),
    isActive: initialData.isActive,
    isStoreWide: initialData.isStoreWide,
    productIds: initialData.products.map(sp => sp.productId),
  } : {
    name: "",
    description: "",
    percentage: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    isStoreWide: false,
    productIds: [],
  }

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const onSubmit = async (data: SaleFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/sales/${params.saleId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/sales`, data)
      }
      router.refresh()
      router.push(`/${params.storeId}/sales`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/sales/${params.saleId}`)
      router.refresh()
      router.push(`/${params.storeId}/sales`)
      toast.success("Sale deleted.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const isStoreWide = form.watch("isStoreWide")

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Sale name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="0"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea disabled={loading} placeholder="Sale description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active
                    </FormLabel>
                    <FormDescription>
                      This sale will be active and applied to eligible products.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isStoreWide"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Store-wide Sale
                    </FormLabel>
                    <FormDescription>
                      Apply this sale to all products in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {!isStoreWide && (
            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Products</FormLabel>
                    <FormDescription>
                      Select the products this sale applies to.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-md p-4">
                    {products.map((product) => (
                      <FormField
                        key={product.id}
                        control={form.control}
                        name="productIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={product.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(product.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value || [], product.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== product.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <div className="flex items-center space-x-2">
                                  {product.images[0] && (
                                    <NextImage
                                      src={product.images[0].url}
                                      alt={product.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {product.category.name} • ${(product.priceInCents / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}