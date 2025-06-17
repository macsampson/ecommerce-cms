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
        <CardTitle>Overview</CardTitle>
        <div className="w-40">
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
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {loading ? <div>Loading...</div> : <Overview data={graphData} />}
      </CardContent>
    </Card>
  )
}

export default DashboardOverview
