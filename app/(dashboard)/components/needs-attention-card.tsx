import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LowStockProduct } from '@/actions/get-low-stock-products'
import { getStockRowStyle } from '@/components/stock-gauge'

interface NeedsAttentionCardProps {
  products: LowStockProduct[]
  storeId: string
}

export function NeedsAttentionCard({
  products,
  storeId
}: NeedsAttentionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Needs attention</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
            Every SKU is above its reorder threshold. Nothing to restock.
          </div>
        ) : (
          <ul className="space-y-1">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/${storeId}/products/${product.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
                  style={getStockRowStyle(product.quantity)}
                >
                  <span className="truncate">
                    {product.name}
                    {(product.color || product.size) && (
                      <span className="text-muted-foreground">
                        {' '}
                        — {[product.color, product.size]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                  </span>
                  <span className="font-data tabular-nums shrink-0 ml-2">
                    {product.quantity} left
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
