"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Trash2, Plus, Settings, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Standalone Purchase Button component
function PurchaseButton({ 
  amount, 
  onSuccess 
}: { 
  amount: number; 
  onSuccess: () => void; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/roleplay?payment=success`,
      },
      redirect: "if_required"
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsLoading(false);
    } else {
      toast.success(`Payment successful! $${amount} credits added to your account.`);
      onSuccess();
    }
  };

  return (
    <Button
      variant="default"
      onClick={handlePurchase}
      disabled={!stripe || isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg"
    >
      {isLoading ? "Processing..." : `Purchase`}
    </Button>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
}

const calculateServiceFee = (amount: number): number => {
  return amount * 0.029 + 0.30;
};

const calculateTotal = (amount: number): number => {
  return amount + calculateServiceFee(amount);
};

// Payment form component that uses Stripe Elements
function CheckoutForm({ 
  amount, 
  onSuccess, 
  onChangePaymentMethod,
  amountInput,
  purchaseButton 
}: { 
  amount: number; 
  onSuccess: () => void; 
  onChangePaymentMethod: () => void;
  amountInput: React.ReactNode;
  purchaseButton: React.ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/roleplay?payment=success`,
      },
      redirect: "if_required"
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsLoading(false);
    } else {
      toast.success(`Payment successful! $${amount} credits added to your account.`);
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <LinkAuthenticationElement />
        <PaymentElement 
          options={{
            layout: "tabs",
            paymentMethodOrder: ["link"]
          }}
        />
        
        {/* Amount input moved here */}
        {amountInput}
      </form>

      {/* Purchase button will be rendered outside the form */}
      <div className="hidden">
        <Button
          onClick={handleSubmit}
          disabled={!stripe || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg"
        >
          {isLoading ? "Processing..." : `Purchase`}
        </Button>
      </div>

     
    </div>
  );
}

// Alternative payment methods page
function AlternativePaymentMethods({ 
  amount, 
  onBack, 
  onSuccess,
  amountInput 
}: { 
  amount: number; 
  onBack: () => void; 
  onSuccess: () => void; 
  amountInput: React.ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/roleplay?payment=success`,
        receipt_email: email || undefined,
      },
      redirect: "if_required"
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsLoading(false);
    } else {
      toast.success(`Payment successful! $${amount} credits added to your account.`);
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-0 h-auto"
        >
          ← Back
        </Button>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Payment Methods</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email (for receipt)
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-10"
          />
        </div>

        {/* Payment Element with all methods */}
        <PaymentElement 
          options={{
            layout: "accordion",
            paymentMethodOrder: [
              "card", 
              "cashapp", 
              "amazon_pay", 
              "klarna",
              "link"
            ]
          }}
        />
        
        {/* Amount input moved here */}
        {amountInput}
      </form>

      {/* Purchase button will be rendered outside in the main component */}
    </div>
  );
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  currentCredits 
}: PaymentModalProps) {
  const [amount, setAmount] = useState("10");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [showInvoices, setShowInvoices] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [showAlternativePayments, setShowAlternativePayments] = useState(false);
  const [showBillingOptions, setShowBillingOptions] = useState(false);
  const [billingAddress, setBillingAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [useOneTimePayment, setUseOneTimePayment] = useState(false);
  const { theme } = useTheme();

  const numericAmount = parseFloat(amount) || 0;
  const serviceFee = calculateServiceFee(numericAmount);
  const total = calculateTotal(numericAmount);

  const handleSuccess = () => {
    setClientSecret("");
    setShowAlternativePayments(false);
    onClose();
  };

  const handleChangePaymentMethod = () => {
    setShowAlternativePayments(true);
  };

  const handleBackToMain = () => {
    setShowAlternativePayments(false);
  };

  // Create payment intent when amount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (numericAmount <= 0) {
        return;
      }

      setIsCreatingPayment(true);
      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: numericAmount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment");
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Payment setup failed"
        );
      } finally {
        setIsCreatingPayment(false);
      }
    };

    if (numericAmount > 0 && isOpen) {
      createPaymentIntent();
    }
  }, [numericAmount, isOpen]);

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: theme === "dark" ? "night" : "stripe",
      variables: {
        colorPrimary: 'hsl(270 60% 60%)',  // Your accent color
        fontFamily: '"Söhne", "Helvetica Neue", Helvetica, Arial, sans-serif',  // Your custom font
        borderRadius: '0.5rem',  // Your --radius
      },
      rules: {
        '.Tab': {
          backgroundColor: 'transparent',
        },
        '.Tab--selected': {
          backgroundColor: 'transparent',
          borderColor: 'hsl(270 60% 60%)',
        },
        '.Tab--selected:hover': {
          backgroundColor: 'transparent',
        },
        '.Input': {
          backgroundColor: 'transparent',
        },
        '.Input--focus': {
          backgroundColor: 'transparent',
          borderColor: 'hsl(270 60% 60%)',
        },
        '.AccordionItem': {
          backgroundColor: 'transparent',
        },
        '.AccordionItem--selected': {
          backgroundColor: 'transparent',
          borderColor: 'hsl(270 60% 60%)',
        },
        '.AccordionItem--selected:hover': {
          backgroundColor: 'transparent',
        },
      }
    }
  };

  // Create the amount input component to pass to child components
  const amountInput = (
    <div className="space-y-2">
      <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Amount
      </Label>
      <Input
        id="amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-right text-2xl font-bold h-12"
        min="1"
        step="1"
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="relative flex-shrink-0">
          
          <DialogTitle className="text-center text-lg font-medium text-gray-600 dark:text-gray-300">
            Add Credits
          </DialogTitle>
          {/* Thin divider below title */}
          <div className="mx-8 mt-4 border-t border-gray-200 dark:border-gray-700" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Stripe Elements Payment Form */}
          {clientSecret && !showAlternativePayments && (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <CheckoutForm 
                amount={numericAmount} 
                onSuccess={handleSuccess}
                onChangePaymentMethod={handleChangePaymentMethod}
                amountInput={amountInput}
                purchaseButton={null}
              />
            </Elements>
          )}

          {/* Alternative Payment Methods View */}
          {clientSecret && showAlternativePayments && (
            <>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <AlternativePaymentMethods
                  amount={numericAmount}
                  onBack={handleBackToMain}
                  onSuccess={handleSuccess}
                  amountInput={amountInput}
                />
              </Elements>
              
              {/* Pricing Breakdown for alternative payments */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service fees</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">${serviceFee.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sales taxes</span>
                  <span className="text-gray-500 dark:text-gray-500">N/A</span>
                </div>
                
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-gray-100">Total due</span>
                  <span className="text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Purchase Button for alternative payments */}
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PurchaseButton amount={numericAmount} onSuccess={handleSuccess} />
              </Elements>
            </>
          )}

          {/* Loading state */}
          {isCreatingPayment && !clientSecret && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Setting up payment...</div>
            </div>
          )}

          {/* Expandable Billing Options - only show on main view */}
          {!showAlternativePayments && (
            <>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowBillingOptions(!showBillingOptions)}
                  className="w-full justify-between text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-0"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Billing Options
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showBillingOptions ? 'rotate-180' : ''}`} />
                </Button>

                {/* Expandable billing options content - now as form fields */}
                {showBillingOptions && (
                  <div className="space-y-4 pl-6 pr-2 py-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <Label htmlFor="billing-address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Billing address
                      </Label>
                      <Input
                        id="billing-address"
                        type="text"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Enter billing address"
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tax-id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax ID
                      </Label>
                      <Input
                        id="tax-id"
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="Enter Tax ID (optional)"
                        className="h-10"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Send me invoices</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInvoices(!showInvoices)}
                        className={`h-5 w-9 rounded-full p-0.5 ml-2 ${
                          showInvoices ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full bg-white transition-transform ${
                            showInvoices ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service fees</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">${serviceFee.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sales taxes</span>
                  <span className="text-gray-500 dark:text-gray-500">N/A</span>
                </div>
                
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-gray-100">Total due</span>
                  <span className="text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Purchase Button - moved below total */}
              {clientSecret && (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <PurchaseButton amount={numericAmount} onSuccess={handleSuccess} />
                </Elements>
              )}

              {/* One-time payment toggle */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Use one-time payment methods</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseOneTimePayment(!useOneTimePayment)}
                  className={`h-5 w-9 rounded-full p-0.5 ${
                    useOneTimePayment ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full bg-white transition-transform ${
                      useOneTimePayment ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </div>
            </>
          )}

          {/* Stripe Logo - bottom middle */}
          <div className="flex justify-center pt-4 pb-2">
            <svg 
              className="w-40 h-auto opacity-80" 
              viewBox="0 0 150 34" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <style>{`.cls-1{fill:#635bff;}`}</style>
              </defs>
              <title>Powered by Stripe - blurple</title>
              <path className="cls-1" d="M146,0H3.73A3.73,3.73,0,0,0,0,3.73V30.27A3.73,3.73,0,0,0,3.73,34H146a4,4,0,0,0,4-4V4A4,4,0,0,0,146,0Zm3,30a3,3,0,0,1-3,3H3.73A2.74,2.74,0,0,1,1,30.27V3.73A2.74,2.74,0,0,1,3.73,1H146a3,3,0,0,1,3,3Z"/>
              <path className="cls-1" d="M17.07,11.24h-4.3V22h1.92V17.84h2.38c2.4,0,3.9-1.16,3.9-3.3S19.47,11.24,17.07,11.24Zm-.1,5H14.69v-3.3H17c1.38,0,2.11.59,2.11,1.65S18.35,16.19,17,16.19Z"/>
              <path className="cls-1" d="M25.1,14a3.77,3.77,0,0,0-3.8,4.09,3.81,3.81,0,1,0,7.59,0A3.76,3.76,0,0,0,25.1,14Zm0,6.67c-1.22,0-2-1-2-2.58s.76-2.58,2-2.58,2,1,2,2.58S26.31,20.66,25.1,20.66Z"/>
              <polygon className="cls-1" points="36.78 19.35 35.37 14.13 33.89 14.13 32.49 19.35 31.07 14.13 29.22 14.13 31.59 22.01 33.15 22.01 34.59 16.85 36.03 22.01 37.59 22.01 39.96 14.13 38.18 14.13 36.78 19.35"/>
              <path className="cls-1" d="M44,14a3.83,3.83,0,0,0-3.75,4.09,3.79,3.79,0,0,0,3.83,4.09A3.47,3.47,0,0,0,47.49,20L46,19.38a1.78,1.78,0,0,1-1.83,1.26A2.12,2.12,0,0,1,42,18.47h5.52v-.6C47.54,15.71,46.32,14,44,14Zm-1.93,3.13A1.92,1.92,0,0,1,44,15.5a1.56,1.56,0,0,1,1.69,1.62Z"/>
              <path className="cls-1" d="M50.69,15.3V14.13h-1.8V22h1.8V17.87a1.89,1.89,0,0,1,2-2,4.68,4.68,0,0,1,.66,0v-1.8c-.14,0-.3,0-.51,0A2.29,2.29,0,0,0,50.69,15.3Z"/>
              <path className="cls-1" d="M57.48,14a3.83,3.83,0,0,0-3.75,4.09,3.79,3.79,0,0,0,3.83,4.09A3.47,3.47,0,0,0,60.93,20l-1.54-.59a1.78,1.78,0,0,1-1.83,1.26,2.12,2.12,0,0,1-2.1-2.17H61v-.6C61,15.71,59.76,14,57.48,14Zm-1.93,3.13a1.92,1.92,0,0,1,1.92-1.62,1.56,1.56,0,0,1,1.69,1.62Z"/>
              <path className="cls-1" d="M67.56,15a2.85,2.85,0,0,0-2.26-1c-2.21,0-3.47,1.85-3.47,4.09s1.26,4.09,3.47,4.09a2.82,2.82,0,0,0,2.26-1V22h1.8V11.24h-1.8Zm0,3.35a2,2,0,0,1-2,2.28c-1.31,0-2-1-2-2.52s.7-2.52,2-2.52c1.11,0,2,.81,2,2.29Z"/>
              <path className="cls-1" d="M79.31,14A2.88,2.88,0,0,0,77,15V11.24h-1.8V22H77v-.83a2.86,2.86,0,0,0,2.27,1c2.2,0,3.46-1.86,3.46-4.09S81.51,14,79.31,14ZM79,20.6a2,2,0,0,1-2-2.28v-.47c0-1.48.84-2.29,2-2.29,1.3,0,2,1,2,2.52S80.25,20.6,79,20.6Z"/>
              <path className="cls-1" d="M86.93,19.66,85,14.13H83.1L86,21.72l-.3.74a1,1,0,0,1-1.14.79,4.12,4.12,0,0,1-.6,0v1.51a4.62,4.62,0,0,0,.73.05,2.67,2.67,0,0,0,2.78-2l3.24-8.62H88.82Z"/>
              <path className="cls-1" d="M125,12.43a3,3,0,0,0-2.13.87l-.14-.69h-2.39V25.53l2.72-.59V21.81a3,3,0,0,0,1.93.7c1.94,0,3.72-1.59,3.72-5.11C128.71,14.18,126.91,12.43,125,12.43Zm-.65,7.63a1.61,1.61,0,0,1-1.28-.52l0-4.11a1.64,1.64,0,0,1,1.3-.55c1,0,1.68,1.13,1.68,2.58S125.36,20.06,124.35,20.06Z"/>
              <path className="cls-1" d="M133.73,12.43c-2.62,0-4.21,2.26-4.21,5.11,0,3.37,1.88,5.08,4.56,5.08a6.12,6.12,0,0,0,3-.73V19.64a5.79,5.79,0,0,1-2.7.62c-1.08,0-2-.39-2.14-1.7h5.38c0-.15,0-.74,0-1C137.71,14.69,136.35,12.43,133.73,12.43Zm-1.47,4.07c0-1.26.77-1.79,1.45-1.79s1.4.53,1.4,1.79Z"/>
              <path className="cls-1" d="M113,13.36l-.17-.82h-2.32v9.71h2.68V15.67a1.87,1.87,0,0,1,2.05-.58V12.54A1.8,1.8,0,0,0,113,13.36Z"/>
              <path className="cls-1" d="M99.46,15.46c0-.44.36-.61.93-.61a5.9,5.9,0,0,1,2.7.72V12.94a7,7,0,0,0-2.7-.51c-2.21,0-3.68,1.18-3.68,3.16,0,3.1,4.14,2.6,4.14,3.93,0,.52-.44.69-1,.69a6.78,6.78,0,0,1-3-.9V22a7.38,7.38,0,0,0,3,.64c2.26,0,3.82-1.15,3.82-3.16C103.62,16.12,99.46,16.72,99.46,15.46Z"/>
              <path className="cls-1" d="M107.28,10.24l-2.65.58v8.93a2.77,2.77,0,0,0,2.82,2.87,4.16,4.16,0,0,0,1.91-.37V20c-.35.15-2.06.66-2.06-1V15h2.06V12.66h-2.06Z"/>
              <polygon className="cls-1" points="116.25 11.7 118.98 11.13 118.98 8.97 116.25 9.54 116.25 11.7"/>
              <rect className="cls-1" x="116.25" y="12.61" width="2.73" height="9.64"/>
            </svg>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}