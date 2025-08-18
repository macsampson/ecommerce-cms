'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ImagePlus, Trash } from 'lucide-react'
import { Input } from './input'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (
    value: { id?: string; url: string; credit: string; ordering: number }[]
  ) => void
  onRemove: (value: string) => void
  value: {
    url: string
    credit: string
    ordering: number
  }[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    const newImage = { url: result.info.secure_url, credit: '', ordering: 0 }
    onChange([...value, newImage])
  }

  const handleCreditChange = (url: string, credit: string) => {
    const updatedValue = value.map((item) =>
      item.url === url ? { ...item, credit } : item
    )
    // console.log('updatedValue', updatedValue)
    onChange(updatedValue)
  }

  const handleOrderingChange = (url: string, ordering: number) => {
    const updatedValue = value.map((item) =>
      item.url === url ? { ...item, ordering } : item
    )
    // console.log('updatedValue', updatedValue)
    onChange(updatedValue)
  }

  if (!isMounted) {
    return null
  }

  // console.log('value', value)

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {value.map(({ url, credit, ordering }) => (
            <div
              key={url}
              className="relative group bg-muted rounded-lg p-2 border hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-square mb-2">
                <Button
                  className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Image
                  width={180}
                  height={180}
                  className="w-full h-full object-cover rounded-md"
                  alt="Product image"
                  src={url}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  className="h-8 text-xs"
                  placeholder="Order"
                  value={ordering}
                  onChange={(e) =>
                    handleOrderingChange(url, Number(e.target.value))
                  }
                />
                <Input
                  className="h-8 text-xs"
                  placeholder="Photo credit"
                  value={credit}
                  onChange={(e) => handleCreditChange(url, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <CldUploadWidget onUpload={onUpload} uploadPreset="ivwjxqjz">
        {({ open }) => {
          const onClick = () => {
            open()
          }

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="outline"
              onClick={onClick}
              className="h-32 w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add Images
                </span>
              </div>
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUpload
