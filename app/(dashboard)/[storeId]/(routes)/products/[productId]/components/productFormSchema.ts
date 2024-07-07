import * as z from 'zod'

export const formSchema = z.object({
  name: z.string().min(1),
  images: z
    .object({
      id: z.string().optional(),
      url: z.string(),
      credit: z.string(),
      ordering: z.coerce.number().min(0)
    })
    .array(),
  price: z.coerce.number().min(1),
  quantity: z.coerce.number().min(0),
  description: z.string().min(1),
  variations: z
    .object({
      id: z.string().optional(),
      name: z.string().min(1),
      price: z.coerce.number().min(1),
      quantity: z.coerce.number().min(0)
    })
    .array()
    .default([]),
  bundles: z
    .object({
      minQuantity: z.coerce.number().min(1),
      discount: z.coerce.number().min(1)
    })
    .array()
    .default([]),
  categoryId: z.string().min(1),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional()
})

export type ProductFormValues = z.infer<typeof formSchema>

export type VariationType = {
  id?: string
  name: string
  price: number
  quantity: number
}

export type BundleType = {
  id?: string
  minQuantity: number
  discount: number
}

export type ImageType = {
  id?: string
  url: string
  credit: string
  ordering: number
}
