import React, { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VariationType } from './productFormSchema'

import { formatPriceDisplay, parsePriceInput } from '@/lib/utils'
import { Label } from '@radix-ui/react-label'

interface VariationInputProps {
  variations: VariationType[]
  setVariations: React.Dispatch<React.SetStateAction<VariationType[]>>
  onAdd: (variation: VariationType) => void
}

const VariationInput: React.FC<VariationInputProps> = ({
  variations,
  setVariations,
  onAdd
}) => {
  const [currentVariation, setCurrentVariation] = useState<VariationType>({
    // id: Date.now().toString(),
    name: '',
    price: 0,
    quantity: 0
  })

  //   console.log('variations', variations)

  const nameInputRef = useRef<HTMLInputElement>(null)

  const addVariation = () => {
    if (currentVariation.name && currentVariation.price) {
      onAdd(currentVariation)
      setCurrentVariation({
        // id: Date.now().toString(),
        name: '',
        price: 0,
        quantity: 0
      })
      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }
    }
  }

  return (
    <div>
      <div className="flex space-x-2 p-2">
        <Input
          ref={nameInputRef}
          className="w-4/5"
          placeholder="Name"
          value={currentVariation.name}
          onChange={(e) => {
            setCurrentVariation((prev) => ({
              ...prev,
              name: e.target.value
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVariation()
            }
          }}
        />
        <Input
          title="Quantity"
          className="w-1/5"
          placeholder="quantity"
          type="number"
          value={currentVariation.quantity}
          onChange={(e) => {
            setCurrentVariation((prev) => ({
              ...prev,
              quantity: parseInt(e.target.value)
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVariation()
            }
          }}
        />
        <Input
          className="w-1/5"
          placeholder="$0.00"
          type="number"
          value={currentVariation.price}
          onChange={(e) => {
            setCurrentVariation((prev) => ({
              ...prev,
              price: parsePriceInput(e.target.value)
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVariation()
            }
          }}
        />
        <Button type="button" className="ml-4" size="sm" onClick={addVariation}>
          Add
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4 border p-2 rounded-md">
        <div className="flex w-full p-2">
          <Label className="flex-1">Name</Label>
          <Label className="flex-1">Quantity</Label>
          <Label className="flex-1">Price</Label>
        </div>
        {variations.length ? (
          variations.map((variation, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                className="w-1/3"
                value={variation.name}
                onChange={(e) => {
                  const newVariations = [...variations]
                  newVariations[index].name = e.target.value
                  setVariations(newVariations)
                }}
              />
              <Input
                className="w-1/3"
                type="number"
                value={variation.quantity}
                onChange={(e) => {
                  const newVariations = [...variations]
                  newVariations[index].quantity = parseInt(e.target.value)
                  setVariations(newVariations)
                }}
              />
              <Input
                className="w-1/3"
                type="number"
                value={variation.price.toFixed(2)}
                onChange={(e) => {
                  const newVariations = [...variations]
                  newVariations[index].price = parseInt(e.target.value)
                  setVariations(newVariations)
                }}
              />
              <Button
                variant="destructive"
                onClick={() => {
                  const newVariations = variations.filter((_, i) => i !== index)
                  setVariations(newVariations)
                }}
              >
                Remove
              </Button>
            </div>
          ))
        ) : (
          <div className="flex mx-auto items-center text-neutral-500 text-opacity-50">
            No variations
          </div>
        )}
      </div>
    </div>
  )
}

export default VariationInput
