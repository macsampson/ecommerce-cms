import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatter } from "@/lib/utils"
// import { ProductVariation } from "@prisma/client"

import React from "react"

interface VariationInputProps {
  variation: { name: string; price: number }
  onRemove: () => void
  onVariationUpdate: (name: string, value: string) => void
  //   updateVariation: (key: number, value: string) => void
  //   key: number
}

const VariationInput: React.FC<VariationInputProps> = ({
  variation,
  onRemove,
  onVariationUpdate,
  //   updateVariation,
  //   key,
}) => {
  const name = variation?.name || ""
  const displayPrice =
    variation?.price && variation.price > 0 ? variation.price : ""

  return (
    <div className="flex items-center space-x-4 justify-between w-full px-2">
      <Input
        className=" text-sm font-medium w-1/2"
        placeholder="Name"
        value={name}
        onChange={(e) => {
          onVariationUpdate("name", e.target.value)
        }}
      />
      <Input
        className="text-sm font-medium text-right w-1/2 "
        placeholder="$0.00"
        value={variation?.price}
        onChange={(e) => {
          onVariationUpdate("price", e.target.value)
        }}
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
