import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { cn, formatter } from '@/lib/utils'
import { DollarSign, ShoppingCart, Boxes, AlertTriangle } from 'lucide-react'
import React from 'react'
import { LOW_STOCK_THRESHOLD } from '@/actions/get-low-stock-products'
import { getGraphRevenue } from '@/actions/get-graph-revenue'
import { getTotalRevenue } from '@/actions/get-total-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'
import { getOrderYears } from '@/actions/get-graph-revenue'
import { getLowStockProducts } from '@/actions/get-low-stock-products'
import { getRecentWebhookEvents } from '@/actions/get-recent-webhook-events'
import DashboardOverview from '../../components/dashboard-overview'
import { NeedsAttentionCard } from '../../components/needs-attention-card'
import { RecentActivityCard } from '../../components/recent-activity-card'

interface DashboardPageProps {
  params: { storeId: string }
}

const DashboardPage: React.FC<DashboardPageProps> = async props => {
  const params = await props.params;
  let totalRevenue = 0
  let salesCount = 0
  let stockCount = 0
  let graphRevenue: any[] = []
  let years: number[] = []
  let lowStockProducts: Awaited<ReturnType<typeof getLowStockProducts>> = []
  let recentEvents: Awaited<ReturnType<typeof getRecentWebhookEvents>> = []

  try {
    totalRevenue = await getTotalRevenue(params.storeId)
  } catch (error) {
    console.error('Failed to fetch total revenue:', error)
  }

  try {
    salesCount = await getSalesCount(params.storeId)
  } catch (error) {
    console.error('Failed to fetch sales count:', error)
  }

  try {
    stockCount = await getStockCount(params.storeId)
  } catch (error) {
    console.error('Failed to fetch stock count:', error)
  }

  try {
    graphRevenue = await getGraphRevenue(params.storeId)
  } catch (error) {
    console.error('Failed to fetch graph revenue:', error)
  }

  try {
    years = await getOrderYears(params.storeId)
  } catch (error) {
    console.error('Failed to fetch order years:', error)
  }

  try {
    lowStockProducts = await getLowStockProducts(params.storeId)
  } catch (error) {
    console.error('Failed to fetch low stock products:', error)
  }

  try {
    recentEvents = await getRecentWebhookEvents(5)
  } catch (error) {
    console.error('Failed to fetch recent webhook events:', error)
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto space-y-4">
        <Heading
          title="Overview"
          description="Revenue, order volume, and fulfillment health at a glance"
        />
        <Separator />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-data font-semibold tabular-nums">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paid orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-data font-semibold tabular-nums">
                {salesCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active SKUs
              </CardTitle>
              <Boxes className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-data font-semibold tabular-nums">
                {stockCount}
              </div>
            </CardContent>
          </Card>
          <Link href={`/${params.storeId}/products`} className="block">
            <Card
              className={cn(
                'transition-colors h-full',
                lowStockProducts.length > 0
                  ? 'hover:border-amber/60'
                  : 'hover:border-primary/40'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stock alerts
                </CardTitle>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    lowStockProducts.length > 0
                      ? 'text-amber'
                      : 'text-muted-foreground'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-data font-semibold tabular-nums">
                  {lowStockProducts.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {lowStockProducts.length > 0
                    ? `At or below ${LOW_STOCK_THRESHOLD} units — view inventory →`
                    : `Reorder threshold is ${LOW_STOCK_THRESHOLD} units`}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <DashboardOverview storeId={params.storeId} years={years} />
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <NeedsAttentionCard
            products={lowStockProducts}
            storeId={params.storeId}
          />
          <RecentActivityCard events={recentEvents} storeId={params.storeId} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
