import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatter } from '@/lib/utils'

import { useState } from 'react'

interface BundleInputProps {
  bundle: { minQuantity: number; discount: number }
  onRemove: () => void
  onBundleUpdate: (key: string, value: string) => void
}

const BundleInput: React.FC<BundleInputProps> = ({
  bundle,
  onRemove,
  onBundleUpdate
}) => {
  const quantity = bundle?.minQuantity || ''
  const displayDiscount = bundle?.discount ? bundle?.discount + '%' : '0%'

  const [discount, setDiscount] = useState(bundle?.discount.toString())
  const [isDiscountFocused, setIsDiscountFocused] = useState(false)

  const formattedDiscount = isDiscountFocused ? discount : displayDiscount

  // console.log("bundle", bundle)

  // function to prevent default behavior of the input when the user presses enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      //blur the input to trigger the onBlur event
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex items-center space-x-4 justify-between w-1/2">
      <Input
        className=" text-sm font-medium w-1/2"
        placeholder="Min Quantity"
        value={quantity}
        onChange={(e) => {
          onBundleUpdate('quantity', e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
      <Input
        className="text-sm font-medium text-right w-1/2 "
        placeholder="0%"
        value={formattedDiscount}
        onFocus={() => {
          setIsDiscountFocused(true)
        }}
        onChange={(e) => {
          setDiscount(e.target.value)
        }}
        onBlur={() => {
          setIsDiscountFocused(false)
          const numberValue = parseFloat(discount.replace(/[^0-9.-]+/g, ''))
          onBundleUpdate('discount', numberValue.toString())
        }}
        onKeyDown={handleKeyDown}
      />
      <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
        -
      </Button>
    </div>
  )
}

export default BundleInput
