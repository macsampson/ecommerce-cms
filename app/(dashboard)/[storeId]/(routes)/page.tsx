import Overview from '@/components/overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { formatter } from '@/lib/utils'
import { CreditCard, DollarSign, Package, Users } from 'lucide-react'
import React from 'react'
import { getGraphRevenue } from '@/actions/get-graph-revenue'
import { getTotalRevenue } from '@/actions/get-total-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'

interface DashboardPageProps {
  params: { storeId: string }
}

// Helper function to construct API URLs
const getApiUrl = (storeId: string, path: string) => {
  // Assuming the app runs on localhost:3000 or a configurable base URL for server-side fetching
  // For server components, relative URLs like `/api/...` might not work directly with axios
  // without a full base URL. Let's construct a full URL.
  // This might need adjustment based on actual deployment environment.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/${storeId}/overview/${path}`
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  // Fetch data using Axios
  // Since this is a server component, these requests happen server-side.
  // Error handling should be added for production (e.g., try/catch per request or a wrapper)

  let totalRevenue = 0
  let salesCount = 0
  let stockCount = 0
  let graphRevenue: any[] = [] // Default to empty array for chart

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
    // graphRevenue will remain empty array, chart will show no data or handle it gracefully
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex-1 w-full max-w-full px-2 py-4 sm:px-4 md:px-8 md:py-6 mx-auto space-y-4">
        <Heading title="Dashboard" description="Overview for your store" />
        <Separator />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">N/A</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Products
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <Overview data={graphRevenue} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
