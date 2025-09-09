"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Wallet } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { toast } from "react-hot-toast";

interface CreditsInfo {
  credits: number;
  ratePerMinute: number;
  estimatedMinutes: number;
}

interface CreditsDisplayProps {
  onCreditsUpdate?: (credits: number) => void;
}

export default function CreditsDisplay({ onCreditsUpdate }: CreditsDisplayProps) {
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo>({
    credits: 0,
    ratePerMinute: 0.15,
    estimatedMinutes: 0,
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/usage/credits");
      if (response.ok) {
        const data = await response.json();
        setCreditsInfo(data);
        onCreditsUpdate?.(data.credits);
      } else {
        console.error("Failed to fetch credits");
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Check for successful payment in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success("Payment successful! Credits have been added to your account.");
      // Remove the success parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh credits
      setTimeout(fetchCredits, 1000);
    }
  }, []);

  if (isLoading) {
    return (
      <Badge variant="secondary" className="px-4 py-2">
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Badge>
    );
  }

  const hasLowCredits = creditsInfo.credits < 0.45; // Less than 3 minutes

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={hasLowCredits ? "destructive" : "secondary"} 
        className="px-4 py-2"
      >
        <Wallet className="mr-2 h-4 w-4" />
        ${creditsInfo.credits.toFixed(2)} ({creditsInfo.estimatedMinutes}min)
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPaymentModalOpen(true)}
        className={hasLowCredits ? "border-orange-500 text-orange-500" : ""}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentCredits={creditsInfo.credits}
      />
    </div>
  );
}