"use client"

import * as z from "zod"
import axios from "axios"
import { useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import {
  Category,
  Color,
  Image,
  Product,
  ProductVariation,
  Size,
  Bundle,
} from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ImageUpload from "@/components/ui/image-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import VariationInput from "./variation-input"
import BundleInput from "./bundle"
import { formatter } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  quantity: z.coerce.number().min(0),
  description: z.string().min(1),
  variations: z
    .object({
      name: z.string().min(1),
      price: z.coerce.number().min(1),
      quantity: z.coerce.number().min(0),
    })
    .array()
    .default([]),
  bundles: z
    .object({
      minQuantity: z.coerce.number().min(1),
      price: z.coerce.number().min(1),
    })
    .array()
    .default([]),
  categoryId: z.string().min(1),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

// type for product variations
type VariationType = {
  id: number
  name: string
  price: number
  quantity: number
  // isDeleted?: boolean
}

type BundleType = {
  minQuantity: number
  price: number
}

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[]
        variations: ProductVariation[]
        bundles: Bundle[]
      })
    | null
  categories: Category[]
  colors: Color[]
  sizes: Size[]
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  sizes,
  colors,
}) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [currentVariation, setCurrentVariation] = useState({
    id: Date.now(),
    name: "",
    price: 0,
    quantity: 0,
    // isDeleted: false,
  })

  const [currentBundle, setCurrentBundle] = useState({
    id: Date.now(),
    minQuantity: 0,
    price: 0,
    // isDeleted: false,
  })

  const [variations, setVariations] = useState<VariationType[]>([])
  const [bundles, setBundles] = useState<BundleType[]>([])

  // Calculate the total quantity of variations
  const totalVariationQuantity = initialData?.variations.reduce(
    (acc, variation) => acc + variation.quantity,
    0
  )

  // console.log("totalVariationQuantity", totalVariationQuantity)

  // const activeVariations = variations.filter(
  //   (variation) => !variation.isDeleted
  // )

  const title = initialData ? "Edit product" : "Create product"
  const formDescription = initialData ? "Edit a product." : "Add a new product"
  const toastMessage = initialData ? "Product updated." : "Product created."
  const action = initialData ? "Save changes" : "Create"

  const defaultValues = initialData
    ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
        quantity:
          initialData.variations?.length > 0
            ? totalVariationQuantity
            : initialData.quantity,
        colorId: initialData.colorId || undefined,
        sizeId: initialData.sizeId || undefined,
        variations:
          initialData?.variations.map((variation) => ({
            ...variation,
            price: parseFloat(String(variation.price)),
            quantity: parseInt(String(variation.quantity)),
          })) || [],
        bundles:
          initialData?.bundles.map((bundle) => ({
            ...bundle,
            price: parseFloat(String(bundle.price)),
          })) || [],
      }
    : {
        name: "",
        images: [],
        price: 0,
        quantity: 0,
        description: "",
        variations: [],
        bundles: [],
        categoryId: "",
        colorId: undefined,
        sizeId: undefined,
        isFeatured: false,
        isArchived: false,
      }

  // console.log("defaultValues", defaultValues)
  // console.log("variationl length", initialData?.variations.length)

  const nameInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (data: ProductFormValues) => {
    console.log("data", data)
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        )
      } else {
        await axios.post(`/api/${params.storeId}/products`, data)
      }
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success(toastMessage)
    } catch (error: any) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success("Product deleted.")
    } catch (error: any) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const addVariation = () => {
    if (currentVariation.name && currentVariation.price) {
      setVariations((prev) => [...prev, currentVariation])
      setCurrentVariation({
        id: Date.now(),
        name: "",
        price: 0,
        quantity: 0,
        // isDeleted: false,
      })
    }
  }

  // const removeVariation = (id: number) => {
  // if variation with id is in initialData.variations, mark it as deleted, else remove it from variations
  // const variation = defaultValues.variations.find(
  //   (variation) => variation.id === id.toString()
  // )

  //   if (variation) {
  //     setVariations((prev) =>
  //       prev.map((variation) =>
  //         variation.id === id ? { ...variation, isDeleted: true } : variation
  //       )
  //     )
  //   } else {
  //     setVariations((prev) => prev.filter((variation) => variation.id !== id))
  //   }
  // }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={title}
          description={formDescription}
        />
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Please enter a description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading || variations.length > 0}
                      placeholder="0"
                      // set to total quantity of variations if variations exist
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variations"
              render={({ field }) => {
                // console.log("field", field.value)
                // console.log("default values", defaultValues.variations)
                const addVariation = () => {
                  const newVariation = {
                    ...currentVariation,
                  }

                  // Update the field.value by appending the new variation
                  field.onChange([...field.value, currentVariation])

                  // Reset the currentVariation input fields
                  setCurrentVariation({
                    id: Date.now(),
                    name: "",
                    price: 0,
                    quantity: 0,
                    // isDeleted: false,
                  })
                }

                return (
                  <FormItem>
                    <FormLabel>Variations</FormLabel>
                    <FormControl>
                      <>
                        <div className="flex space-x-2 p-2">
                          <Input
                            ref={nameInputRef}
                            className="w-4/5"
                            placeholder="Name"
                            value={currentVariation.name}
                            onChange={(e) => {
                              setCurrentVariation((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addVariation()
                                if (nameInputRef.current) {
                                  nameInputRef.current.focus()
                                }
                              }
                            }}
                          />
                          <Input
                            title="Quantity"
                            className="w-1/5"
                            placeholder="please add quantity"
                            type="number"
                            value={currentVariation.quantity}
                            onChange={(e) => {
                              setCurrentVariation((prev) => ({
                                ...prev,
                                quantity: parseInt(e.target.value),
                              }))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addVariation()
                                if (nameInputRef.current) {
                                  nameInputRef.current.focus()
                                }
                              }
                            }}
                          />
                          <Input
                            className="w-1/5"
                            placeholder="$0.00"
                            type="number"
                            value={currentVariation.price}
                            onChange={(e) => {
                              setCurrentVariation((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value),
                              }))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addVariation()
                                if (nameInputRef.current) {
                                  nameInputRef.current.focus()
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            className="ml-4"
                            size="sm"
                            onClick={() => {
                              addVariation()
                              if (nameInputRef.current) {
                                nameInputRef.current.focus()
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-col items-center space-y-4 border p-2 rounded-md">
                          {field.value.length ? (
                            field.value.map((variation, index) => (
                              /* if variation is not marked as deleted, render it */
                              // variation.isDeleted ? null : (
                              // <div
                              //   key={variation.name}
                              //   className="flex items-center space-x-4 justify-between w-full px-2"
                              // >
                              <VariationInput
                                key={index}
                                variation={variation}
                                onRemove={() => {
                                  const newVariations = field.value.filter(
                                    (_, i) => i !== index
                                  )
                                  field.onChange(newVariations)
                                }}
                                onVariationUpdate={(name, value) => {
                                  const newVariations = [...field.value]
                                  if (name === "name") {
                                    newVariations[index].name = value
                                  } else if (name === "price") {
                                    newVariations[index].price =
                                      parseFloat(value)
                                  } else if (name === "quantity") {
                                    newVariations[index].quantity =
                                      parseInt(value)
                                  }
                                  field.onChange(newVariations)
                                }}
                              />
                              // </div>
                            ))
                          ) : (
                            <div className="flex mx-auto items-center text-neutral-500 text-opacity-50">
                              No variations
                            </div>
                          )}
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="bundles"
              render={({ field }) => {
                // console.log("field", field.value)
                // console.log("default values", defaultValues.variations)
                const addBundle = () => {
                  const newBundle = {
                    ...currentBundle,
                  }
                  // console.log("current bundle", currentBundle)
                  // Update the field.value by appending the new Bundle
                  field.onChange([...field.value, currentBundle])

                  // Reset the currentBundle input fields
                  setCurrentBundle({
                    id: Date.now(),
                    minQuantity: 0,
                    price: 0,
                    // isDeleted: false,
                  })
                }

                return (
                  <FormItem>
                    <FormLabel>Bundles</FormLabel>
                    <FormControl>
                      <>
                        <div className="flex space-x-2 p-2">
                          <Input
                            ref={nameInputRef}
                            className="w-1/6"
                            placeholder="Min Qty"
                            type="number"
                            min="1"
                            // value={currentBundle.minQuantity}
                            onChange={(e) => {
                              setCurrentBundle((prev) => ({
                                ...prev,
                                minQuantity: parseInt(e.target.value),
                              }))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addBundle()
                                if (nameInputRef.current) {
                                  nameInputRef.current.focus()
                                }
                              }
                            }}
                          />
                          <Input
                            className="w-1/5"
                            placeholder="$0.00"
                            type="number"
                            value={currentBundle.price}
                            onChange={(e) => {
                              setCurrentBundle((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value),
                              }))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addBundle()
                                if (nameInputRef.current) {
                                  nameInputRef.current.focus()
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            className="ml-4"
                            size="sm"
                            onClick={() => {
                              addBundle()
                              if (nameInputRef.current) {
                                nameInputRef.current.focus()
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-col items-center space-y-4 border p-2 rounded-md">
                          {field.value.length ? (
                            field.value.map((bundle, index) => (
                              /* if bundle is not marked as deleted, render it */
                              // bundle.isDeleted ? null : (
                              // <div
                              //   key={bundle.name}
                              //   className="flex items-center space-x-4 justify-between w-full px-2"
                              // >
                              <BundleInput
                                key={index}
                                bundle={bundle}
                                onRemove={() => {
                                  const newBundle = field.value.filter(
                                    (_, i) => i !== index
                                  )
                                  field.onChange(newBundle)
                                }}
                                onBundleUpdate={(name, value) => {
                                  const newBundle = [...field.value]
                                  if (name === "quantity") {
                                    newBundle[index].minQuantity =
                                      parseInt(value)
                                  } else if (name === "price") {
                                    newBundle[index].price = parseFloat(value)
                                  }
                                  field.onChange(newBundle)
                                }}
                              />
                              // </div>
                            ))
                          ) : (
                            <div className="flex mx-auto items-center text-neutral-500 text-opacity-50">
                              No bundles
                            </div>
                          )}
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sizes <span className="text-neutral-500">(optional)</span>
                  </FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a size"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem
                          key={size.id}
                          value={size.id}
                        >
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Color <span className="text-neutral-500">(optional)</span>
                  </FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a color"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem
                          key={color.id}
                          value={color.id}
                        >
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            className="ml-auto"
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
