import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatter } from "@/lib/utils"

import { useState } from "react"

interface VariationInputProps {
  variation: { name: string; price: number }
  onRemove: () => void
  onVariationUpdate: (name: string, value: string) => void
}

const VariationInput: React.FC<VariationInputProps> = ({
  variation,
  onRemove,
  onVariationUpdate,
}) => {
  const name = variation?.name || ""
  const displayPrice = formatter.format(variation?.price || 0)

  const [price, setPrice] = useState(variation?.price.toString())
  const [isPriceFocused, setIsPriceFocused] = useState(false)

  const formattedPrice = isPriceFocused ? price : displayPrice

  // function to prevent default behavior of the input when the user presses enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      //blur the input to trigger the onBlur event
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex items-center space-x-4 justify-between w-full">
      <Input
        className=" text-sm font-medium w-4/5"
        placeholder="Name"
        value={name}
        onChange={(e) => {
          onVariationUpdate("name", e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
      <Input
        className="text-sm font-medium text-right w-1/5 "
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
          onVariationUpdate("price", numberValue.toString())
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

export default VariationInput
