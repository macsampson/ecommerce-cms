'use client'

import { PlusIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { BillboardColumn, columns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import ApiList from '@/components/ui/api-list'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'

import ImageUpload from '@/components/ui/image-upload'
import { toast } from 'react-hot-toast'

import * as z from 'zod'

import { CarouselImage } from '@prisma/client'
import { Input } from '@/components/ui/input'

interface BillboardClientProps {
  billboardData: BillboardColumn[]
  carouselImages: CarouselImage[]
}

const formSchema = z.object({
  images: z.object({ imageUrl: z.string() }).array(),
  imageCredits: z.string().optional()
})

type CarouselValues = z.infer<typeof formSchema>

export const BillboardClient: React.FC<BillboardClientProps> = ({
  billboardData,
  carouselImages
}) => {
  const router = useRouter()
  const params = useParams()

  const initialData = carouselImages
    ? {
        images: carouselImages.map((image) => ({
          imageUrl: image.imageUrl
        }))
      }
    : {
        images: []
      }
  // console.log("initialData", initialData)
  const form = useForm<CarouselValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  })

  const onSubmit = async (values: CarouselValues) => {
    console.log('values: ', values)

    // const { images } = values
    // console.log("images", images)
    if (values.images.length === 0) {
      toast.error('You must upload at least one image.')
      return
    }

    const data = await axios.post(
      `/api/${params.storeId}/billboards/carousel`,
      values
    )

    router.refresh()
    // console.log("data", data)
  }
  // console.log("these are the params", params)

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${billboardData.length})`}
          description="Manage your billboards"
        />

        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <DataTable columns={columns} data={billboardData} searchKey="label" />
      <Separator />
      <Heading title="Carousel" description="Carousel of billboards" />
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
                    value={field.value.map((image) => image.imageUrl)}
                    // disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { imageUrl: url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter(
                          (current) => current.imageUrl !== url
                        )
                      ])
                    }
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

      <Separator />
      <Heading title="API" description="API calls for billboards" />
      <Separator />
      <ApiList entityName="billboards" entityIdName="billboardId" />
    </>
  )
}
