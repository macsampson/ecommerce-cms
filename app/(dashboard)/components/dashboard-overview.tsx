'use client'

import React, { useEffect, useState } from 'react'
import Overview from '@/components/overview'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { BarChart3 } from 'lucide-react'

interface DashboardOverviewProps {
  storeId: string
  years: number[]
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  storeId,
  years
}) => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(years[0])
  const [graphData, setGraphData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    fetch(`/api/${storeId}/overview/graph-revenue?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setGraphData(data))
      .finally(() => setLoading(false))
  }, [storeId, selectedYear])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle>Revenue &amp; order volume</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bars track monthly revenue, the line tracks paid order count
          </p>
        </div>
        <div className="w-40">
          {years.length > 0 ? (
            <Select
              value={selectedYear?.toString()}
              onValueChange={(val) => setSelectedYear(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {years.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8" />
            <p className="text-sm max-w-xs">
              No paid orders yet — once your first sale clears, this chart
              fills in month by month.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader />
          </div>
        ) : (
          <Overview data={graphData} />
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardOverview
