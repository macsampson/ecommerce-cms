'use client'

import React, { useRef, useState, useEffect, use } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import PriceInput from '@/components/ui/priceInput'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { AlertModal } from '@/components/modals/alert-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import ImageUpload from '@/components/ui/image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import VariationInput from './variationInput'
import BundleInput from './bundleInput'
import {
  formSchema,
  ProductFormValues,
  VariationType,
  BundleType,
  ImageType
} from './productFormSchema'

import {
  Category,
  Color,
  Image,
  Product,
  ProductVariation,
  Size,
  Bundle
} from '@prisma/client'

import { formatter, formatPriceDisplay, parsePriceInput } from '@/lib/utils'

interface ProductFormProps {
  initialData:
    | (Omit<Product, 'price'> & {
        price: number
        images: Image[]
        variations: (Omit<ProductVariation, 'price'> & { price: number })[]
        bundles: (Omit<Bundle, 'discount'> & { discount: number })[]
        weight: number
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
  colors
}) => {
  // console.log('initialData', initialData)

  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [images, setImages] = useState<ImageType[]>(
    initialData?.images.map((img) => ({
      id: img.id,
      url: img.url,
      credit: img.credit,
      ordering: img.ordering
    })) || []
  )

  console.log('images', images)

  const [variations, setVariations] = useState<VariationType[]>(
    initialData?.variations.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      quantity: v.quantity
    })) || []
  )

  const [bundles, setBundles] = useState<BundleType[]>(
    initialData?.bundles.map((b) => ({
      id: b.id,
      minQuantity: b.minQuantity,
      discount: Number(b.discount)
    })) || []
  )

  const title = initialData ? 'Edit product' : 'Create product'
  const formDescription = initialData ? 'Edit a product.' : 'Add a new product'
  const toastMessage = initialData ? 'Product updated.' : 'Product created.'
  const action = initialData ? 'Save changes' : 'Create'

  const totalVariationQuantity = variations.reduce(
    (acc, variation) => acc + variation.quantity,
    0
  )

  const initialQuantity = initialData?.quantity || 0

  // console.log('initialQuantity', initialQuantity)

  const defaultValues = initialData
    ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
        quantity: initialQuantity,
        weight: parseFloat(String(initialData.weight)),
        colorId: initialData.colorId || undefined,
        sizeId: initialData.sizeId || undefined,
        variations:
          initialData?.variations.map((variation) => ({
            ...variation,
            price: parseFloat(String(variation.price)),
            quantity: parseInt(String(variation.quantity))
          })) || [],
        bundles:
          initialData?.bundles.map((bundle) => ({
            ...bundle,
            minQuantity: parseInt(String(bundle.minQuantity)),
            discount: parseInt(String(bundle.discount))
          })) || [],
        images:
          initialData?.images.map((image) => ({
            ...image,
            id: image.id,
            url: image.url,
            credit: image.credit,
            ordering: image.ordering
          })) || []
      }
    : {
        name: '',
        images: [],
        price: 0,
        quantity: 0,
        description: '',
        variations: [],
        bundles: [],
        weight: 0,
        categoryId: '',
        colorId: undefined,
        sizeId: undefined,
        isFeatured: false,
        isArchived: false
      }

  // console.log('defaultValues', defaultValues)

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    form.setValue('images', images)
    // console.log('variations', variations)
    // console.log('images', images)
  }, [images])

  useEffect(() => {
    form.setValue('variations', variations)
    form.setValue(
      'quantity',
      totalVariationQuantity ? totalVariationQuantity : initialQuantity
    )
    // console.log('totalVariationQuantity', totalVariationQuantity)
  }, [variations])

  useEffect(() => {
    form.setValue('bundles', bundles)
    // console.log('bundles', bundles)
  }, [bundles])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const onSubmit = async (data: ProductFormValues) => {
    console.log('data', data)
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
      toast.error('Something went wrong.')
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
      toast.success('Product deleted.')
    } catch (error: any) {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={formDescription} />
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
                    value={field.value}
                    disabled={loading}
                    onChange={(newImages) => {
                      field.onChange(newImages)
                      setImages(newImages)
                    }}
                    onRemove={(url) => {
                      const updatedImages = field.value.filter(
                        (img) => img.url !== url
                      )
                      field.onChange(updatedImages)
                      setImages(updatedImages)
                    }}
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
            <Controller
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <PriceInput field={field} loading={false} />
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
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(parseInt(e.target.value))
                      }}
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
                return (
                  <FormItem>
                    <FormLabel>Variations</FormLabel>
                    <FormControl>
                      <>
                        <VariationInput
                          onAdd={(variation: VariationType) => {
                            const newVariations = [...field.value, variation]
                            field.onChange(newVariations)
                            setVariations(newVariations)
                          }}
                          variations={variations}
                          setVariations={setVariations}
                        />
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
                const addBundleHandler = (bundle: BundleType) => {
                  const newBundles = [...field.value, bundle]
                  field.onChange(newBundles)
                  setBundles(newBundles)
                }

                return (
                  <FormItem>
                    <FormLabel>Bundles</FormLabel>
                    <FormControl>
                      <>
                        <BundleInput
                          onAdd={addBundleHandler}
                          bundles={bundles}
                          setBundles={setBundles}
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (grams)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      // disabled={loading || variations.length > 0}
                      placeholder="1.00"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                        <SelectItem key={category.id} value={category.id}>
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
                        <SelectItem key={size.id} value={size.id}>
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
                        <SelectItem key={color.id} value={color.id}>
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
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
