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
      <div className="flex space-x-2 p-2">
        <Input
          ref={nameInputRef}
          className="w-1/6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="Min Qty"
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
        <div className="relative w-1/5">
          <Input
            className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            type="number"
            step="0.01"
            value={currentBundle.discount ? currentBundle.discount.toFixed(2) : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
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
      <div className="flex flex-col items-center space-y-4 border p-2 rounded-md">
        {Object.keys(bundles) ? (
          bundles.map((bundle, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                className="w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                value={bundle.minQuantity || ''}
                onChange={(e) => {
                  const newBundles = [...bundles]
                  newBundles[index].minQuantity = e.target.value === '' ? 0 : parseInt(e.target.value)
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
                    newBundles[index].discount = e.target.value === '' ? 0 : parseFloat(e.target.value)
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
          <div className="flex mx-auto items-center text-neutral-500 text-opacity-50">
            No bundles
          </div>
        )}
      </div>
    </div>
  )
}

export default BundleInput
