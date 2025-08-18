import React, { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BundleType } from './productFormSchema'
import { parsePriceInput } from '@/lib/utils'

interface BundleInputProps {
  bundles: BundleType[]
  setBundles: React.Dispatch<React.SetStateAction<BundleType[]>>
  onAdd: (bundle: BundleType) => void
}

const BundleInput: React.FC<BundleInputProps> = ({
  bundles,
  setBundles,
  onAdd
}) => {
  const [currentBundle, setCurrentBundle] = useState<BundleType>({
    minQuantity: 0,
    discount: 0
  })

  const nameInputRef = useRef<HTMLInputElement>(null)

  const addBundle = () => {
    if (currentBundle.minQuantity && currentBundle.discount) {
      onAdd(currentBundle)
      setCurrentBundle({
        minQuantity: 0,
        discount: 0
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
          className="w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="Min Quantity"
          type="number"
          min="1"
          value={currentBundle.minQuantity || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : parseInt(e.target.value)
            setCurrentBundle((prev) => ({
              ...prev,
              minQuantity: value
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addBundle()
            }
          }}
        />
        <div className="relative w-1/3">
          <Input
            className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            type="number"
            step="0.01"
            value={
              currentBundle.discount ? currentBundle.discount.toFixed(2) : ''
            }
            onChange={(e) => {
              const value =
                e.target.value === '' ? 0 : parseFloat(e.target.value)
              setCurrentBundle((prev) => ({
                ...prev,
                discount: value
              }))
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addBundle()
              }
            }}
            onFocus={(e) => {
              e.target.select()
            }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            %
          </div>
        </div>
        <Button type="button" className="ml-4" size="sm" onClick={addBundle}>
          Add
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4 border p-4 rounded-md">
        {bundles.length > 0 ? (
          bundles.map((bundle, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                className="w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                value={bundle.minQuantity || ''}
                onChange={(e) => {
                  const newBundles = [...bundles]
                  newBundles[index].minQuantity =
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                  setBundles(newBundles)
                }}
              />
              <div className="relative w-1/3">
                <Input
                  className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  step="0.01"
                  value={bundle.discount ? bundle.discount.toFixed(2) : ''}
                  onChange={(e) => {
                    const newBundles = [...bundles]
                    newBundles[index].discount =
                      e.target.value === '' ? 0 : parseFloat(e.target.value)
                    setBundles(newBundles)
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  %
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  const newBundles = bundles.filter((_, i) => i !== index)
                  setBundles(newBundles)
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
                  d="M4 7l8-4 8 4-8 4-8-4zm0 0v10l8 4v-10zm16 0v10l-8 4v-10z"
                />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              No bundle pricing configured
            </h4>
            <p className="text-xs text-muted-foreground/80 mb-4 max-w-xs mx-auto">
              Add quantity-based discounts to encourage bulk purchases. For
              example: "Buy 3+ items, get 10% off"
            </p>
            <div className="space-y-2 text-xs text-muted-foreground/70">
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded">
                <span>3 items</span>
                <span>10% off</span>
              </div>
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded">
                <span>5 items</span>
                <span>20% off</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BundleInput
