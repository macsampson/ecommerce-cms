import prismadb from '@/lib/prismadb'
import { ProductForm } from './components/product-form'

const ProductPage = async ({
  params
}: {
  params: { productId: string; storeId: string }
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId
    },
    include: {
      images: true,
      variations: true,
      bundles: true
    }
  })

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId
    }
  })
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId
    }
  })
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId
    }
  })

  const convertedProduct = product
    ? {
        ...product,
        weight: product.weight.toNumber(), // Convert Decimal to number
        price: product.price.toNumber(), // Convert Decimal to number
        variations: product.variations.map((variation) => ({
          ...variation,
          price: variation.price.toNumber() // Convert Decimal to number
        })),
        bundles: product.bundles.map((bundle) => ({
          ...bundle,
          discount: bundle.discount.toNumber() // Convert Decimal to number
        }))
      }
    : null

  // console.log(product)
  return (
    <div className="flex-col h-full">
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {convertedProduct && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {convertedProduct.name}
            </h1>
          </div>
        )}
        <ProductForm
          categories={categories}
          sizes={sizes}
          colors={colors}
          initialData={convertedProduct}
        />
      </div>
    </div>
  )
}

export default ProductPage
