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
          className="w-1/6"
          placeholder="Min Qty"
          type="number"
          min="1"
          onChange={(e) => {
            setCurrentBundle((prev) => ({
              ...prev,
              minQuantity: parseInt(e.target.value)
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addBundle()
            }
          }}
        />
        <Input
          className="w-1/5"
          placeholder="0%"
          type="number"
          value={currentBundle.discount}
          onChange={(e) => {
            setCurrentBundle((prev) => ({
              ...prev,
              discount: parsePriceInput(e.target.value)
            }))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addBundle()
            }
          }}
        />
        <Button type="button" className="ml-4" size="sm" onClick={addBundle}>
          Add
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4 border p-2 rounded-md">
        {Object.keys(bundles) ? (
          bundles.map((bundle, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                className="w-1/3"
                type="number"
                value={bundle.minQuantity}
                onChange={(e) => {
                  const newBundles = [...bundles]
                  newBundles[index].minQuantity = parsePriceInput(
                    e.target.value
                  )
                  setBundles(newBundles)
                }}
              />
              <Input
                className="w-1/3"
                type="number"
                value={bundle.discount}
                onChange={(e) => {
                  const newBundles = [...bundles]
                  newBundles[index].discount = parseInt(e.target.value)
                  setBundles(newBundles)
                }}
              />
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
