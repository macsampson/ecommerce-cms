import React, { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VariationType } from './productFormSchema'
import PriceInput from '@/components/ui/priceInput'

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
      <div className="flex space-x-2 py-2">
        <Input
          ref={nameInputRef}
          className="w-2/5"
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
          className="w-1/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="Quantity"
          type="number"
          value={currentVariation.quantity || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : parseInt(e.target.value)
            setCurrentVariation((prev) => ({
              ...prev,
              quantity: value
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVariation()
            }
          }}
        />
        <div className="w-1/5">
          <PriceInput
            field={{
              value: currentVariation.price,
              onChange: (value: number) => {
                setCurrentVariation((prev) => ({
                  ...prev,
                  price: value
                }))
              },
              onBlur: () => {},
              name: 'currentVariationPrice',
              ref: () => {}
            }}
            loading={false}
            placeholder="0.00"
          />
        </div>
        <Button type="button" className="ml-4" size="sm" onClick={addVariation}>
          Add
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4 border p-4 rounded-md">
        {variations.length > 0 && (
          <div className="flex w-full p-2">
            <Label className="flex-1">Name</Label>
            <Label className="flex-1">Quantity</Label>
            <Label className="flex-1">Price</Label>
          </div>
        )}
        {variations.length > 0 ? (
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
                className="w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                value={variation.quantity || ''}
                onChange={(e) => {
                  const newVariations = [...variations]
                  newVariations[index].quantity =
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                  setVariations(newVariations)
                }}
              />
              <div className="w-1/3">
                <PriceInput
                  field={{
                    value: variation.price,
                    onChange: (value: number) => {
                      const newVariations = [...variations]
                      newVariations[index].price = value
                      setVariations(newVariations)
                    },
                    onBlur: () => {},
                    name: `variationPrice${index}`,
                    ref: () => {}
                  }}
                  loading={false}
                  placeholder="$0.00"
                />
              </div>
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
          <div className="text-center py-8 px-4">
            <div className="text-muted-foreground mb-3">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              No product variations configured
            </h4>
            <p className="text-xs text-muted-foreground/80 mb-4 max-w-xs mx-auto">
              Add different sizes, colors, or styles with specific pricing and
              inventory for each variation.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground/70">
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded pointer-events-none">
                <span>Small - Red</span>
                <div className="flex gap-2">
                  <span>10 qty</span>
                  <span>$19.99</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded pointer-events-none">
                <span>Large - Blue</span>
                <div className="flex gap-2">
                  <span>5 qty</span>
                  <span>$24.99</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VariationInput
