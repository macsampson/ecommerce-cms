'use client'

import React, { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useTheme } from 'next-themes'

interface OverviewProps {
  data: any[]
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  const { resolvedTheme } = useTheme()
  const [barColor, setBarColor] = useState<string>('#3498db')

  useEffect(() => {
    // Wait for the DOM to update the theme class
    const timeout = setTimeout(() => {
      const root = document.documentElement
      const style = getComputedStyle(root)
      const primary = style.getPropertyValue('--primary').trim()
      const color = primary.includes(' ') ? `hsl(${primary})` : primary
      setBarColor(color)
    }, 10) // 10ms is usually enough

    return () => clearTimeout(timeout)
  }, [resolvedTheme])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default Overview
