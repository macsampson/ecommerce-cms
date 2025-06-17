'use client'

import { useState, useEffect } from 'react'
import { Edit } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useParams } from 'next/navigation'

export default function ShippingPage() {
  const params = useParams()
  const storeId = params.storeId
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [senderAddress, setSenderAddress] = useState({
    name: '',
    company: '',
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: ''
  })
  const [shippoEnabled, setShippoEnabled] = useState(false)
  const [chitchatsEnabled, setChitchatsEnabled] = useState(false)
  const [customsDeclaration, setCustomsDeclaration] = useState({
    certify: true,
    certify_signer: '',
    contents_explanation: '',
    contents_type: '',
    eel_pfc: '',
    incoterm: '',
    non_delivery_option: '',
    items: [
      {
        description: '',
        mass_unit: '',
        origin_country: '',
        tarrif_number: ''
      }
    ]
  })
  const [customsModalOpen, setCustomsModalOpen] = useState(false)

  useEffect(() => {
    axios
      .get(`/api/${storeId}/shipping-settings`)
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          setSenderAddress({ ...data })
          setShippoEnabled(data.shippoEnabled)
          setChitchatsEnabled(data.chitchatsEnabled)
          if (data.customsDeclaration)
            setCustomsDeclaration({ ...data.customsDeclaration })
        }
      })
  }, [storeId])

  const saveSettings = async (
    overrides: Partial<{
      shippoEnabled: boolean
      chitchatsEnabled: boolean
    }> = {}
  ) => {
    await axios.put(`/api/${storeId}/shipping-settings`, {
      ...senderAddress,
      shippoEnabled: overrides.shippoEnabled ?? shippoEnabled,
      chitchatsEnabled: overrides.chitchatsEnabled ?? chitchatsEnabled,
      customsDeclaration
    })
    toast.success('Settings saved')
  }

  const handleShippoToggle = (checked: boolean) => {
    setShippoEnabled(checked)
    saveSettings({ shippoEnabled: checked })
  }

  const handleChitchatsToggle = (checked: boolean) => {
    setChitchatsEnabled(checked)
    saveSettings({ chitchatsEnabled: checked })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Shipping Providers Section */}
      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold flex items-center gap-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
            Shipping Providers
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Shippo</span>
            <Switch
              checked={shippoEnabled}
              onCheckedChange={handleShippoToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">ChitChats</span>
            <Switch
              checked={chitchatsEnabled}
              onCheckedChange={handleChitchatsToggle}
            />
          </div>
        </div>
      </section>
      <Separator className="my-2" />
      {/* Sender Address Section */}
      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold flex items-center gap-2 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1a4 4 0 01-4-4z"
                />
              </svg>
              Sender Address
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              {senderAddress.street1}, {senderAddress.city},{' '}
              {senderAddress.state} {senderAddress.zip}
            </div>
          </div>
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            onClick={() => setAddressModalOpen(true)}
            aria-label="Edit sender address"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-foreground">
          <div>
            <span className="font-semibold">Name:</span>{' '}
            {senderAddress.name || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Company:</span>{' '}
            {senderAddress.company || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Street:</span>{' '}
            {senderAddress.street1 || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">City:</span>{' '}
            {senderAddress.city || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">State/Province:</span>{' '}
            {senderAddress.state || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Postal/Zip Code:</span>{' '}
            {senderAddress.zip || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Country:</span>{' '}
            {senderAddress.country || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Phone:</span>{' '}
            {senderAddress.phone || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Email:</span>{' '}
            {senderAddress.email || 'N/A'}
          </div>
        </div>
      </section>
      <Modal
        title="Edit Sender Address"
        description="Update the address packages will be sent from."
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAddressModalOpen(false)
            saveSettings()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-2">
            <Label>Name</Label>
            <Input
              value={senderAddress.name}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, name: e.target.value })
              }
              placeholder="Name"
            />
            <Label>Company</Label>
            <Input
              value={senderAddress.company}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, company: e.target.value })
              }
              placeholder="Company"
            />
            <Label>Street</Label>
            <Input
              value={senderAddress.street1}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, street1: e.target.value })
              }
              placeholder="Street Address"
            />
            <Label>City</Label>
            <Input
              value={senderAddress.city}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, city: e.target.value })
              }
              placeholder="City"
            />
            <Label>State/Province</Label>
            <Input
              value={senderAddress.state}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, state: e.target.value })
              }
              placeholder="State/Province"
            />
            <Label>Postal/Zip Code</Label>
            <Input
              value={senderAddress.zip}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, zip: e.target.value })
              }
              placeholder="Postal/Zip Code"
            />
            <Label>Country</Label>
            <Input
              value={senderAddress.country}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, country: e.target.value })
              }
              placeholder="Country"
            />
            <Label>Phone</Label>
            <Input
              value={senderAddress.phone}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, phone: e.target.value })
              }
              placeholder="Phone"
            />
            <Label>Email</Label>
            <Input
              value={senderAddress.email}
              onChange={(e) =>
                setSenderAddress({ ...senderAddress, email: e.target.value })
              }
              placeholder="Email"
            />
          </div>
          <Button type="submit" className="w-full mt-2">
            Save
          </Button>
        </form>
      </Modal>
      <Separator className="my-2" />

      {/* Customs Declaration Section */}
      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold flex items-center gap-2 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a2 2 0 01-2-2v-2a6 6 0 016-6h2a6 6 0 016 6v2a2 2 0 01-2 2h-2m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2"
                />
              </svg>
              Customs Declaration
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold">Certify:</span>{' '}
              {customsDeclaration.certify ? 'Yes' : 'No'} |{' '}
              <span className="font-semibold">Type:</span>{' '}
              {customsDeclaration.contents_type || 'N/A'} |{' '}
              <span className="font-semibold">Incoterm:</span>{' '}
              {customsDeclaration.incoterm || 'N/A'} |{' '}
              <span className="font-semibold">Item:</span>{' '}
              {customsDeclaration.items[0]?.description || 'N/A'}
            </div>
          </div>
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            onClick={() => setCustomsModalOpen(true)}
            aria-label="Edit customs declaration"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-foreground">
          <div>
            <span className="font-semibold">Certify:</span>{' '}
            {customsDeclaration.certify ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-semibold">Certify Signer:</span>{' '}
            {customsDeclaration.certify_signer || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Contents Explanation:</span>{' '}
            {customsDeclaration.contents_explanation || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Contents Type:</span>{' '}
            {customsDeclaration.contents_type || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">EEL PFC:</span>{' '}
            {customsDeclaration.eel_pfc || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Incoterm:</span>{' '}
            {customsDeclaration.incoterm || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Non-Delivery Option:</span>{' '}
            {customsDeclaration.non_delivery_option || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Item Description:</span>{' '}
            {customsDeclaration.items[0]?.description || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Item Mass Unit:</span>{' '}
            {customsDeclaration.items[0]?.mass_unit || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Item Origin Country:</span>{' '}
            {customsDeclaration.items[0]?.origin_country || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Item Tariff Number:</span>{' '}
            {customsDeclaration.items[0]?.tarrif_number || 'N/A'}
          </div>
        </div>
      </section>
      <Modal
        title="Edit Customs Declaration"
        description="Update the default customs declaration for international shipments."
        isOpen={customsModalOpen}
        onClose={() => setCustomsModalOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setCustomsModalOpen(false)
            await saveSettings()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-2">
            <span>
              <Label>Certify</Label>
              <input
                className="ml-2"
                type="checkbox"
                checked={customsDeclaration.certify}
                onChange={(e) =>
                  setCustomsDeclaration((cd) => ({
                    ...cd,
                    certify: e.target.checked
                  }))
                }
              />
            </span>
            <Label>Certify Signer</Label>
            <Input
              value={customsDeclaration.certify_signer}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  certify_signer: e.target.value
                }))
              }
              placeholder="Certify Signer"
            />
            <Label>Contents Explanation</Label>
            <Input
              value={customsDeclaration.contents_explanation}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  contents_explanation: e.target.value
                }))
              }
              placeholder="Contents Explanation"
            />
            <Label>Contents Type</Label>
            <Input
              value={customsDeclaration.contents_type}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  contents_type: e.target.value
                }))
              }
              placeholder="Contents Type"
            />
            <Label>EEL PFC</Label>
            <Input
              value={customsDeclaration.eel_pfc}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  eel_pfc: e.target.value
                }))
              }
              placeholder="EEL PFC"
            />
            <Label>Incoterm</Label>
            <Input
              value={customsDeclaration.incoterm}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  incoterm: e.target.value
                }))
              }
              placeholder="Incoterm"
            />
            <Label>Non-Delivery Option</Label>
            <Input
              value={customsDeclaration.non_delivery_option}
              onChange={(e) =>
                setCustomsDeclaration((cd) => ({
                  ...cd,
                  non_delivery_option: e.target.value
                }))
              }
              placeholder="Non-Delivery Option"
            />
            <div className="mt-4">
              <h3 className="font-medium mb-1">Item</h3>
              <Label>Description</Label>
              <Input
                value={customsDeclaration.items[0].description}
                onChange={(e) =>
                  setCustomsDeclaration((cd) => ({
                    ...cd,
                    items: [{ ...cd.items[0], description: e.target.value }]
                  }))
                }
                placeholder="Description"
              />
              <Label>Mass Unit</Label>
              <Input
                value={customsDeclaration.items[0].mass_unit}
                onChange={(e) =>
                  setCustomsDeclaration((cd) => ({
                    ...cd,
                    items: [{ ...cd.items[0], mass_unit: e.target.value }]
                  }))
                }
                placeholder="Mass Unit"
              />
              <Label>Origin Country</Label>
              <Input
                value={customsDeclaration.items[0].origin_country}
                onChange={(e) =>
                  setCustomsDeclaration((cd) => ({
                    ...cd,
                    items: [{ ...cd.items[0], origin_country: e.target.value }]
                  }))
                }
                placeholder="Origin Country"
              />
              <Label>Tariff Number</Label>
              <Input
                value={customsDeclaration.items[0].tarrif_number}
                onChange={(e) =>
                  setCustomsDeclaration((cd) => ({
                    ...cd,
                    items: [{ ...cd.items[0], tarrif_number: e.target.value }]
                  }))
                }
                placeholder="Tariff Number"
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  )
}
