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
  const [shippoEnabled, setShippoEnabled] = useState(true)
  const [chitchatsEnabled, setChitchatsEnabled] = useState(true)
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
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shipping Settings</h1>
      <Separator className="mb-6" />
      {/* Sender Address Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-large text-lg font-bold">Sender Address</span>
          <div className="text-xs text-gray-400">
            {senderAddress.street1}, {senderAddress.city}, {senderAddress.state}{' '}
            {senderAddress.zip}
          </div>
        </div>
        <button
          className="p-1 text-gray-400 hover:text-black"
          onClick={() => setAddressModalOpen(true)}
          aria-label="Edit sender address"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
      {/* Shipping Providers Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-large text-lg font-bold">
            Rate + Label Providers
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Shippo</span>
          <Switch
            checked={shippoEnabled}
            onCheckedChange={handleShippoToggle}
          />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">ChitChats</span>
          <Switch
            checked={chitchatsEnabled}
            onCheckedChange={handleChitchatsToggle}
          />
        </div>
      </div>
      {/* Sender Address Modal */}
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
      {/* Customs Declaration Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-large text-lg font-bold">
              Customs Declaration
            </span>
            <div className="text-xs text-gray-400">
              {customsDeclaration.contents_explanation},{' '}
              {customsDeclaration.contents_type}, {customsDeclaration.incoterm}
            </div>
          </div>
          <button
            className="p-1 text-gray-400 hover:text-black"
            onClick={() => setCustomsModalOpen(true)}
            aria-label="Edit customs declaration"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
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
                      items: [
                        { ...cd.items[0], origin_country: e.target.value }
                      ]
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
    </div>
  )
}
