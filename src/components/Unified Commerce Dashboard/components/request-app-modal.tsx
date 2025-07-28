// src/components/Unified Commerce Dashboard/tabs/apps/request-app-modal.tsx
"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// --- 1. Import useUser alongside useAuth ---
import { useAuth, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase/client";

// Re-using the components from your AppsPage file
const Button = ({ children, variant = "default", size = "md", className = "", ...props }: any) => <button className={`rounded-md font-medium transition-colors ${variant === "ghost" ? "text-gray-700 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"} ${size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2"} ${className}`} {...props}>{children}</button>;
const Input = ({ className = "", ...props }: any) => <input className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
const Label = ({ children, className = "", ...props }: any) => <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>{children}</label>;
const Textarea = ({ className = "", ...props }: any) => <textarea className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;

interface RequestAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestAppModal({ isOpen, onClose }: RequestAppModalProps) {
  const { getToken } = useAuth();
  // --- 2. Get the full user object from Clerk. This contains the user's ID. ---
  const { user } = useUser();

  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [exampleCompany, setExampleCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- 3. Add a guard clause to ensure the user object is loaded before submitting ---
    if (!user) {
      setError("Cannot submit request: User not authenticated.");
      return;
    }
    if (!appName) {
      setError("App name is required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const supabaseToken = await getToken({ template: 'supabase' });
      if (!supabaseToken) {
          throw new Error("Could not retrieve authentication token.");
      }

      const supabase = createClerkSupabaseClient(supabaseToken);

      const { error: insertError } = await supabase
        .from("app_requests")
        .insert({
          app_name: appName,
          description: description || null,
          example_company: exampleCompany || null,
          // --- 4. THIS IS THE FIX: Add the user's Clerk ID to the data payload ---
          user_id: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setAppName("");
        setDescription("");
        setExampleCompany("");
        onClose();
        setIsSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error("Submission failed:", error);
      setError(`Submission failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Request a New App</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            {isSuccess ? (
                <div className="py-12 text-center">
                    <h3 className="text-lg font-medium text-green-600">Thank you!</h3>
                    <p className="mt-2 text-gray-600">Your app request has been submitted.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <Label htmlFor="app-name">App Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="app-name"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="e.g., AI-Powered Content Writer"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this app should do..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="example-company">Example Company (Optional)</Label>
                        <Input
                            id="example-company"
                            value={exampleCompany}
                            onChange={(e) => setExampleCompany(e.target.value)}
                            placeholder="e.g., Jasper.ai, Copy.ai"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
}