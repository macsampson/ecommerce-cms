'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ImagePlus, Trash } from 'lucide-react'
import { Input } from './input'
import { FormField } from './form'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: { id?: string; url: string; credit: string }[]) => void
  onRemove: (value: string) => void
  value: {
    url: string
    credit: string
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
    const newImage = { url: result.info.secure_url, credit: '' }
    onChange([...value, newImage])
  }

  const handleCreditChange = (url: string, credit: string) => {
    const updatedValue = value.map((item) =>
      item.url === url ? { ...item, credit } : item
    )
    // console.log('updatedValue', updatedValue)
    onChange(updatedValue)
  }

  if (!isMounted) {
    return null
  }

  // console.log('value', value)

  return (
    <div>
      <div className="mb-4 flex items-center gap-5">
        <div className="border-2 flex w-full flex-wrap gap-5 p-5 rounded-md">
          {value.map(({ url, credit }) => (
            <div
              key={url}
              className="relative flex flex-col rounded-md overflow-hidden border p-2"
            >
              <div className="relative">
                <Button
                  className="z-10 absolute top-2 right-2"
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Image
                  // sizes="(max-width: 200px) 100vw, 200px"
                  width={300}
                  height={300}
                  className="object-cover mb-2 rounded-md"
                  alt="Image"
                  src={url}
                />
              </div>
              <Input
                className="mt-auto"
                placeholder="credit?"
                value={credit}
                onChange={(e) => handleCreditChange(url, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="ivwjxqjz">
        {({ open }) => {
          const onClick = () => {
            open()
          }

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUpload
