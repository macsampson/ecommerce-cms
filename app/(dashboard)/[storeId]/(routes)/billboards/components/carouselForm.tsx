'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'react-hot-toast'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'

import * as z from 'zod'

import { CarouselImage } from '@prisma/client'

const formSchema = z.object({
  images: z
    .object({
      imageUrl: z.string(),
      imageCredit: z.string()
    })
    .array()
})

// TODO: add ordering for carousel images

type CarouselValues = z.infer<typeof formSchema>

interface CarouselFormProps {
  initialImages: CarouselImage[]
}

export const CarouselForm: React.FC<CarouselFormProps> = ({
  initialImages
}) => {
  const router = useRouter()
  const params = useParams()

  const initialData = initialImages
    ? {
        images: initialImages.map((image) => ({
          imageUrl: image.imageUrl,
          imageCredit: image.imageCredit
        }))
      }
    : {
        images: []
      }

  const form = useForm<CarouselValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  })

  const onSubmit = async (values: CarouselValues) => {
    if (values.images.length === 0) {
      toast.error('You must upload at least one image.')
      return
    }

    try {
      await axios.post(`/api/${params.storeId}/billboards/carousel`, values)
      router.refresh()
      toast.success('Carousel saved successfully.')
    } catch (error) {
      toast.error('Failed to save carousel.')
    }
  }

  const handleImageChange = (
    updatedImages: { url: string; credit: string }[]
  ) => {
    form.setValue(
      'images',
      updatedImages.map(({ url, credit }) => ({
        imageUrl: url,
        imageCredit: credit
      }))
    )
  }

  const handleImageRemove = (url: string) => {
    const updatedImages = form
      .getValues('images')
      .filter((img) => img.imageUrl !== url)
    form.setValue('images', updatedImages)
  }

  return (
    <>
      <Heading title="Carousel" description="Carousel for the landing page" />
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
                    value={field.value.map((image) => ({
                      url: image.imageUrl,
                      credit: image.imageCredit,
                      ordering: 0
                    }))}
                    onChange={handleImageChange}
                    onRemove={handleImageRemove}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="default">
            Save
          </Button>
        </form>
      </Form>
    </>
  )
}
