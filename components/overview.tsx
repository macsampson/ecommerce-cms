'use client'

import React from 'react'
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

interface OverviewProps {
  data: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const revenue = payload.find((p: any) => p.dataKey === 'total')?.value ?? 0
  const orders = payload.find((p: any) => p.dataKey === 'orders')?.value ?? 0
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground px-3 py-2 text-xs shadow-md font-data">
      <p className="font-semibold mb-1">{label}</p>
      <p>Revenue: ${revenue.toLocaleString()}</p>
      <p>Orders: {orders}</p>
    </div>
  )
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="revenue"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar
          yAxisId="revenue"
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[3, 3, 0, 0]}
          barSize={22}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="hsl(var(--signal-teal))"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default Overview
