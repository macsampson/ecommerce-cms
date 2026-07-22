'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Loader2, PackageCheck, Printer, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertModal } from '@/components/modals/alert-modal'

type ParsedAddress = {
  name: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
}

type Parcel = {
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

type Rate = {
  id: string
  provider: string
  title: string
  description: string
  amount: string
  currency: string
  estimated_days: number
}

type ShippingLabel = {
  carrier: string | null
  serviceLevel: string | null
  labelUrl: string | null
  trackingNumber: string | null
  trackingUrlProvider: string | null
  costAmount: string | null
  costCurrency: string | null
  purchasedAt: string
}

type Stage = 'loading' | 'form' | 'rates' | 'purchased' | 'error'

const emptyAddress: ParsedAddress = {
  name: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  email: ''
}

export const ShippingLabelSection: React.FC<{ orderId: string }> = ({
  orderId
}) => {
  const params = useParams()
  const storeId = params.storeId

  const [stage, setStage] = useState<Stage>('loading')
  const [error, setError] = useState<string | null>(null)
  const [address, setAddress] = useState<ParsedAddress>(emptyAddress)
  const [parcel, setParcel] = useState<Parcel>({
    weightGrams: 0,
    lengthCm: 23,
    widthCm: 16,
    heightCm: 5
  })
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [shippingLabel, setShippingLabel] = useState<ShippingLabel | null>(
    null
  )
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(
          `/api/${storeId}/orders/${orderId}`
        )
        if (data.shippingLabel) {
          setShippingLabel(data.shippingLabel)
          setStage('purchased')
          return
        }
        setAddress(data.shipToAddress || data.parsedAddress || emptyAddress)
        setParcel(data.defaultParcel)
        setStage('form')
      } catch (err) {
        setError('Could not load order shipping details.')
        setStage('error')
      }
    }
    load()
  }, [orderId, storeId])

  const getRates = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await axios.post(
        `/api/${storeId}/orders/${orderId}/shipping-rates`,
        { address, parcel }
      )
      if (!data.success) {
        setError(data.error || 'Could not fetch shipping rates.')
        return
      }
      setRates(data.rates)
      setSelectedRateId(null)
      setStage('rates')
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Could not fetch shipping rates.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const purchaseLabel = async () => {
    const selectedRate = rates.find((rate) => rate.id === selectedRateId)
    if (!selectedRate) return

    setSubmitting(true)
    setError(null)
    try {
      const { data } = await axios.post(
        `/api/${storeId}/orders/${orderId}/purchase-label`,
        { rateObjectId: selectedRate.id, rate: selectedRate, parcel }
      )
      if (!data.success) {
        setError(data.error || 'Could not purchase this label.')
        return
      }
      setShippingLabel(data.shippingLabel)
      setStage('purchased')
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Could not purchase this label.'
      )
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  if (stage === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading shipping details…
      </div>
    )
  }

  if (stage === 'purchased' && shippingLabel) {
    return (
      <div className="rounded-md border border-border p-4 bg-muted/40 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <PackageCheck className="h-4 w-4 text-emerald-600" />
          Label purchased
        </div>
        <dl className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Carrier</dt>
          <dd className="col-span-2">
            {shippingLabel.carrier} {shippingLabel.serviceLevel}
          </dd>
          <dt className="text-muted-foreground">Tracking</dt>
          <dd className="col-span-2 font-data">
            {shippingLabel.trackingUrlProvider ? (
              <a
                href={shippingLabel.trackingUrlProvider}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 inline-flex items-center gap-1"
              >
                <Truck className="h-3 w-3" />
                {shippingLabel.trackingNumber}
              </a>
            ) : (
              shippingLabel.trackingNumber || '—'
            )}
          </dd>
        </dl>
        {shippingLabel.labelUrl && (
          <Button asChild size="sm" variant="outline">
            <a
              href={shippingLabel.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Label
            </a>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stage !== 'rates' && (
        <div className="space-y-3 rounded-md border border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ship-name">Name</Label>
              <Input
                id="ship-name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ship-phone">Phone</Label>
              <Input
                id="ship-phone"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="ship-street1">Street</Label>
              <Input
                id="ship-street1"
                value={address.street1}
                onChange={(e) =>
                  setAddress({ ...address, street1: e.target.value })
                }
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="ship-street2">Apartment / Suite</Label>
              <Input
                id="ship-street2"
                value={address.street2}
                onChange={(e) =>
                  setAddress({ ...address, street2: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ship-city">City</Label>
              <Input
                id="ship-city"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ship-state">State / Province</Label>
              <Input
                id="ship-state"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ship-zip">ZIP / Postal Code</Label>
              <Input
                id="ship-zip"
                value={address.zip}
                onChange={(e) =>
                  setAddress({ ...address, zip: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ship-country">Country (2-letter code)</Label>
              <Input
                id="ship-country"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="parcel-weight">Weight (g)</Label>
              <Input
                id="parcel-weight"
                type="number"
                min="0.01"
                step="0.01"
                value={parcel.weightGrams}
                onChange={(e) =>
                  setParcel({
                    ...parcel,
                    weightGrams: Number(e.target.value)
                  })
                }
              />
              {parcel.weightGrams <= 0 && (
                <p className="text-xs text-destructive">
                  Weight must be greater than 0 — carriers reject
                  zero-weight parcels.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="parcel-length">Length (cm)</Label>
              <Input
                id="parcel-length"
                type="number"
                value={parcel.lengthCm}
                onChange={(e) =>
                  setParcel({ ...parcel, lengthCm: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="parcel-width">Width (cm)</Label>
              <Input
                id="parcel-width"
                type="number"
                value={parcel.widthCm}
                onChange={(e) =>
                  setParcel({ ...parcel, widthCm: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="parcel-height">Height (cm)</Label>
              <Input
                id="parcel-height"
                type="number"
                value={parcel.heightCm}
                onChange={(e) =>
                  setParcel({ ...parcel, heightCm: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={getRates}
            disabled={submitting || parcel.weightGrams <= 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Rates
          </Button>
        </div>
      )}

      {stage === 'rates' && (
        <div className="space-y-3 rounded-md border border-border p-4">
          <div className="space-y-2">
            {rates.map((rate) => (
              <label
                key={rate.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm cursor-pointer hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="rate"
                    value={rate.id}
                    checked={selectedRateId === rate.id}
                    onChange={() => setSelectedRateId(rate.id)}
                  />
                  <div>
                    <p className="font-medium">{rate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {rate.description}
                    </p>
                  </div>
                </div>
                <span className="font-data tabular-nums">
                  {rate.amount} {rate.currency}
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStage('form')}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={!selectedRateId || submitting}
              onClick={() => setConfirmOpen(true)}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Purchase Label
            </Button>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={purchaseLabel}
        loading={submitting}
      />
    </div>
  )
}
