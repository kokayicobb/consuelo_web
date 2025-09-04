"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
}

function CheckoutForm({ amount, onComplete }: { amount: number; onComplete: () => void }) {
  const fetchClientSecret = useCallback(async () => {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    return data.clientSecret;
  }, [amount]);

  const options = { 
    fetchClientSecret,
    onComplete: () => {
      toast.success("Payment successful! Your credits will be added shortly.");
      onComplete();
    }
  };

  return (
    <div className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  currentCredits 
}: PaymentModalProps) {
  const [amount, setAmount] = useState("10");
  const [showCheckout, setShowCheckout] = useState(false);

  const presetAmounts = [5, 10, 25, 50, 100];

  const handleCheckout = () => {
    const amountNum = parseFloat(amount);
    
    if (amountNum < 5 || amountNum > 500) {
      toast.error("Amount must be between $5 and $500");
      return;
    }

    setShowCheckout(true);
  };

  const handleBack = () => {
    setShowCheckout(false);
  };

  const estimatedMinutes = Math.floor(parseFloat(amount) / 0.15);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={showCheckout ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Roleplay Credits
            {showCheckout && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="ml-auto"
              >
                ← Back
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Purchase credits for roleplay coaching sessions at $0.15/minute
          </DialogDescription>
        </DialogHeader>

        {showCheckout ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Purchasing ${amount} = ~{estimatedMinutes} minutes of coaching
            </div>
            <CheckoutForm 
              amount={parseFloat(amount)} 
              onComplete={() => {
                setShowCheckout(false);
                onClose();
              }} 
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Balance */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Balance:</span>
                  <Badge variant="secondary">
                    ${currentCredits.toFixed(2)} ({Math.floor(currentCredits / 0.15)}min)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Amount</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {presetAmounts.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    variant={amount === presetAmount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(presetAmount.toString())}
                  >
                    ${presetAmount}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  min="5"
                  max="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ${amount} = ~{estimatedMinutes} minutes of coaching
              </p>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={handleCheckout} 
              disabled={!amount}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Continue to Payment
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe. Credits never expire. Supports Link for fast checkout.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}