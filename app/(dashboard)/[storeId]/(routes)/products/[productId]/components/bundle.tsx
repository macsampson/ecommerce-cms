import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatter } from "@/lib/utils"

import { useState } from "react"

interface BundleInputProps {
  bundle: { minQuantity: number; price: number }
  onRemove: () => void
  onBundleUpdate: (key: string, value: string) => void
}

const BundleInput: React.FC<BundleInputProps> = ({
  bundle,
  onRemove,
  onBundleUpdate,
}) => {
  const quantity = bundle?.minQuantity || ""
  const displayPrice = formatter.format(bundle?.price || 0)

  const [price, setPrice] = useState(bundle?.price.toString())
  const [isPriceFocused, setIsPriceFocused] = useState(false)

  const formattedPrice = isPriceFocused ? price : displayPrice

  // console.log("bundle", bundle)

  // function to prevent default behavior of the input when the user presses enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
          onBundleUpdate("quantity", e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
      <Input
        className="text-sm font-medium text-right w-1/2 "
        placeholder="$0.00"
        value={formattedPrice}
        onFocus={() => {
          setIsPriceFocused(true)
        }}
        onChange={(e) => {
          setPrice(e.target.value)
        }}
        onBlur={() => {
          setIsPriceFocused(false)
          const numberValue = parseFloat(price.replace(/[^0-9.-]+/g, ""))
          onBundleUpdate("price", numberValue.toString())
        }}
        onKeyDown={handleKeyDown}
      />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onRemove}
      >
        -
      </Button>
    </div>
  )
}

export default BundleInput
