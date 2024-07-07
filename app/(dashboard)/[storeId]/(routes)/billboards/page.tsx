import prismadb from '@/lib/prismadb'
import { BillboardClient } from './components/client'
import { BillboardColumn } from './components/columns'
import { format } from 'date-fns'

const BillboardsPage = async ({ params }: { params: { storeId: string } }) => {
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedBillboards: BillboardColumn[] = billboards.map(
    (billboard) => ({
      id: billboard.id,
      label: billboard.label,
      landingPage: billboard.landingPage,
      createdAt: format(billboard.createdAt, 'MMMM do, yyyy')
    })
  )

  const carouselImages = await prismadb.carouselImage.findMany({
    where: {
      storeId: params.storeId
    }
  })

  // console.log('carouselImages', carouselImages)

  // const formattedCarouselImages = carouselImages.map((image) => ({
  //   order: image.order,
  //   // label: image.label,
  //   imageUrl: image.imageUrl,
  //   createdAt: format(image.createdAt, "MMMM do, yyyy"),
  // }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient
          billboardData={formattedBillboards}
          carouselImages={carouselImages}
        />
      </div>
    </div>
  )
}

export default BillboardsPage
