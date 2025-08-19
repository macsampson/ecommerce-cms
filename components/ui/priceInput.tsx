import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ControllerRenderProps } from 'react-hook-form'

const parsePriceInput = (value: string | number) => {
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/[^0-9.-]+/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

const formatPrice = (value: number) => {
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatForInput = (value: number) => {
  return value > 0 ? value.toFixed(2) : ''
}

interface PriceInputProps {
  field: ControllerRenderProps<any, any>
  loading: boolean
  placeholder?: string
}

const PriceInput: React.FC<PriceInputProps> = ({ field, loading, placeholder = '$0.00' }) => {
  const [inputValue, setInputValue] = useState(() => formatForInput(field.value || 0))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatForInput(field.value || 0))
    }
  }, [field.value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers, decimal point, and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setInputValue(value)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    const price = parsePriceInput(inputValue)
    field.onChange(price)
    setInputValue(formatForInput(price))
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    e.target.select()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        US$
      </div>
      <Input
        type="text"
        disabled={loading}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="h-10 pl-12"
      />
    </div>
  )
}

export default PriceInput
