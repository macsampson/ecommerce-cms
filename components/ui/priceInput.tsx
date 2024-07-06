import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ControllerRenderProps } from 'react-hook-form'

const parsePriceInput = (value: string) => {
  const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

const formatPrice = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

interface PriceInputProps {
  field: ControllerRenderProps<any, any>
  loading: boolean
}

const PriceInput: React.FC<PriceInputProps> = ({ field, loading }) => {
  const [inputValue, setInputValue] = useState(field.value)

  const handleBlur = () => {
    const price = parsePriceInput(inputValue)
    setInputValue(formatPrice(price))
    field.onChange(price)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
  }

  return (
    <Input
      type="text"
      disabled={loading}
      placeholder="9.99"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={(e) => e.target.select()}
      onKeyDown={handleKeyDown}
    />
  )
}

export default PriceInput
