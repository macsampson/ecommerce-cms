'use client'

import React, { useState, useEffect } from 'react'
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
  ProductVariation,
  Size,
  Bundle
} from '@prisma/client'

interface ProductFormProps {
  initialData: {
    price: number
    quantity: number
    images: Image[]
    variations: (Omit<ProductVariation, 'price'> & { price: number })[]
    bundles: (Omit<Bundle, 'discount'> & { discount: number })[]
    weight: number
    categoryId: string
    colorId: string | null
    sizeId: string | null
    isFeatured: boolean
    isArchived: boolean
  } | null
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

  // console.log('images', images)

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

  // Form configuration
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  useEffect(() => {
    form.setValue('images', images)
    // console.log('variations', variations)
    // console.log('images', images)
  }, [images, form])

  useEffect(() => {
    form.setValue('variations', variations)
    form.setValue(
      'quantity',
      totalVariationQuantity ? totalVariationQuantity : initialQuantity
    )
    // console.log('totalVariationQuantity', totalVariationQuantity)
  }, [variations, form, totalVariationQuantity, initialQuantity])

  useEffect(() => {
    form.setValue('bundles', bundles)
    // console.log('bundles', bundles)
  }, [bundles, form])

  const onSubmit = async (data: ProductFormValues) => {
    // console.log('data', data)
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data,
          { timeout: 30000 }
        )
      } else {
        await axios.post(`/api/${params.storeId}/products`, data, { timeout: 30000 })
      }
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success(toastMessage)
    } catch (error: any) {
      console.error('Form submission error:', error)
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error('Something went wrong.')
      }
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
          className="space-y-8 w-full max-w-7xl mx-auto pt-10"
        >
          {/* Product Images Section */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Product Images
            </h3>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
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
          </div>

          {/* Basic Information Section */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Product Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter product name"
                        className="h-10"
                        {...field}
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
                    <FormLabel className="text-sm font-medium">
                      Category
                    </FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
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
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        placeholder="Enter a detailed product description"
                        className="min-h-[500px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing & Inventory Section */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="price"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Price</FormLabel>
                    <FormControl>
                      <PriceInput field={field} loading={loading} />
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
                    <FormLabel className="text-sm font-medium">
                      Quantity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading || variations.length > 0}
                        placeholder="0"
                        className="h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === '' ? 0 : parseInt(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Weight (grams)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={loading}
                        placeholder="0.00"
                        className="h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Product Attributes Section */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Product Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sizeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Size{' '}
                      <span className="text-neutral-500 font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
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
                    <FormLabel className="text-sm font-medium">
                      Color{' '}
                      <span className="text-neutral-500 font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
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
            </div>
          </div>

          {/* Product Options Section */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Product Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Featured Product
                      </FormLabel>
                      <FormDescription className="text-xs">
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Archived Product
                      </FormLabel>
                      <FormDescription className="text-xs">
                        This product will not appear in the store
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Advanced Options Section */}
          <div className="bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border/50 shadow-sm">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Advanced Options
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Configure product variations and bundle pricing for enhanced
                selling options
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Variations Card */}
                <div className="group">
                  <FormField
                    control={form.control}
                    name="variations"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="bg-muted/30 rounded-lg border border-border/30 p-5 hover:border-primary/20 transition-all duration-200 hover:shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <div className="h-4 w-4 rounded bg-blue-500"></div>
                              </div>
                              <div>
                                <FormLabel className="text-base font-medium text-card-foreground">
                                  Product Variations
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Add size, color, or style variations
                                </p>
                              </div>
                            </div>
                            <FormControl>
                              <VariationInput
                                onAdd={(variation: VariationType) => {
                                  const newVariations = [
                                    ...field.value,
                                    variation
                                  ]
                                  field.onChange(newVariations)
                                  setVariations(newVariations)
                                }}
                                variations={variations}
                                setVariations={setVariations}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                </div>

                {/* Bundle Pricing Card */}
                <div className="group">
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
                          <div className="bg-muted/30 rounded-lg border border-border/30 p-5 hover:border-primary/20 transition-all duration-200 hover:shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <div className="h-4 w-4 rounded bg-green-500"></div>
                              </div>
                              <div>
                                <FormLabel className="text-base font-medium text-card-foreground">
                                  Bundle Pricing
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Set quantity-based discounts
                                </p>
                              </div>
                            </div>
                            <FormControl>
                              <BundleInput
                                onAdd={addBundleHandler}
                                bundles={bundles}
                                setBundles={setBundles}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spacer to account for sticky buttons */}
          <div className="pb-24"></div>
        </form>
      </Form>

      {/* Sticky Form Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {initialData
                ? 'Update your product information'
                : 'Create a new product'}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${params.storeId}/products`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
                className="min-w-[120px]"
              >
                {loading ? 'Saving...' : action}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
