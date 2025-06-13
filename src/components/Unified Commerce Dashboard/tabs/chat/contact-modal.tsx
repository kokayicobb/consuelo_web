// components/ContactModal.tsx
import { Dialog } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Mail, Phone, MessageSquare, Clock, X } from "lucide-react";
import { generateSalesScript } from "@/components/Unified Commerce Dashboard/lib/actions/prompt_actions"; // Import the generateSalesScript function

import type { OtfContactLog } from "@/types/otf";
import { ClientScriptData } from "@/types/scripts-modal";

export default function ContactModal({
  isOpen,
  onClose,
  type,
  contact,
  clientName,
  clientData = {}, // Add clientData parameter with default empty object
  onScriptGenerated = (script, scriptType) => {}, // Add new prop for script generation callback
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "email" | "phone";
  contact: string;
  clientName: string;
  clientData?: ClientScriptData;
  onScriptGenerated?: (script: string, scriptType: "call" | "email") => void;
}) {
  // Add state for script generation loading state
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Function to handle script generation
  const handleGenerateScript = async (scriptType: "call" | "email") => {
    try {
      setIsGeneratingScript(true);

      // Use the clientData directly from props
      const contactLogs = clientData?.contactLogs || [];

      // Generate script using the existing function from lib/actions.ts
      const script = await generateSalesScript({
        scriptType,
        clientName,
        queryContext: `Contact ${clientName} via ${scriptType === "call" ? "phone" : "email"} at ${contact}`,
        contactLogs: contactLogs, // Pass the contact logs for personalization
      });

      // Close this modal first
      onClose();

      // Pass the generated script back to parent component
      onScriptGenerated(script, scriptType);
    } catch (error) {
      console.error("Error generating script:", error);
      alert(
        `Error generating script: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const actions =
    type === "email"
      ? [
          {
            label: "Draft Email",
            icon: <Mail size={16} />,
            action: () => alert("Opening email draft..."),
          },
          {
            label: "Generate Email Script",
            icon: <MessageSquare size={16} />,
            action: () => handleGenerateScript("email"),
          },
          {
            label: "Schedule Follow-up",
            icon: <Clock size={16} />,
            action: () => alert("Scheduling..."),
          },
        ]
      : [
          {
            label: "Initiate Call",
            icon: <Phone size={16} />,
            action: () => alert("Initiating call..."),
          },
          {
            label: "Generate Call Script",
            icon: <MessageSquare size={16} />,
            action: () => handleGenerateScript("call"),
          },
          {
            label: "Schedule Follow-up",
            icon: <Clock size={16} />,
            action: () => alert("Scheduling..."),
          },
        ];

  return (
    <Dialog as={Fragment} open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Dialog.Panel className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <Dialog.Title className="mb-2 text-lg font-medium text-gray-900">
            {type === "email" ? "Email" : "Call"} {clientName}
          </Dialog.Title>
          <p className="mb-4 text-sm text-gray-600">{contact}</p>
          <div className="space-y-3">
            {actions.map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex w-full items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                disabled={isGeneratingScript && label.includes("Generate")}
              >
                {isGeneratingScript && label.includes("Generate") ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                ) : (
                  icon
                )}
                {isGeneratingScript && label.includes("Generate")
                  ? "Generating..."
                  : label}
              </button>
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
