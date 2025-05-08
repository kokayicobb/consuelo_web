// components/ContactModal.tsx
import { Dialog } from "@headlessui/react"
import { Fragment } from "react"
import { Mail, Phone, MessageSquare, Clock, X } from "lucide-react"

export default function ContactModal({ isOpen, onClose, type, contact, clientName }: {
  isOpen: boolean
  onClose: () => void
  type: "email" | "phone"
  contact: string
  clientName: string
}) {
  const actions = type === "email"
    ? [
        { label: "Draft Email", icon: <Mail size={16} />, action: () => alert("Opening email draft...") },
        { label: "Generate Email Script", icon: <MessageSquare size={16} />, action: () => alert("Generating script...") },
        { label: "Schedule Follow-up", icon: <Clock size={16} />, action: () => alert("Scheduling...") },
      ]
    : [
        { label: "Initiate Call", icon: <Phone size={16} />, action: () => alert("Initiating call...") },
        { label: "Generate Call Script", icon: <MessageSquare size={16} />, action: () => alert("Generating script...") },
        { label: "Schedule Follow-up", icon: <Clock size={16} />, action: () => alert("Scheduling...") },
      ]

  return (
    <Dialog as={Fragment} open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
            {type === "email" ? "Email" : "Call"} {clientName}
          </Dialog.Title>
          <p className="text-sm text-gray-600 mb-4">{contact}</p>
          <div className="space-y-3">
            {actions.map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
