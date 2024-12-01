"use client"
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Shirt, Building2, Zap, SendIcon } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import * as gtag from '@/lib/gtag'  // Import gtag for analytics

export function Contact() {
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    // Get form data
    const formData = new FormData(e.currentTarget)
    const submission = {
      full_name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      website: formData.get('website'),
      message: formData.get('message'),
      submitted_at: new Date().toISOString()
    }

    try {
      // Insert into Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([submission])

      if (error) throw error

      // Track successful submission
      gtag.event({
        action: 'form_submission',
        category: 'engagement',
        label: 'demo_request'
      })

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your interest! We\'ll be in touch soon.'
      })

      // Reset form
      e.currentTarget.reset()

    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'There was an error submitting your request. Please try again.'
      })

      // Track failed submission
      gtag.event({
        action: 'form_error',
        category: 'error',
        label: 'demo_request_failed'
      })
    }

    setIsSubmitting(false)
  };

  return (
    <div className="w-full bg-gradient-to-b from-background to-background/80 py-24 sm:py-20">
      {/* ... your existing JSX until the form ... */}

      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              name="name"  // Added name attribute
              placeholder="Jane Smith" 
              type="text"
              className="bg-background/50"
              required 
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company"
              name="company"  // Added name attribute
              placeholder="Fashion Brand Inc." 
              type="text"
              className="bg-background/50"
              required 
            />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Business Email</Label>
          <Input 
            id="email"
            name="email"  // Added name attribute
            placeholder="jane@fashionbrand.com" 
            type="email"
            className="bg-background/50"
            required 
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="website">Company Website (Optional)</Label>
          <Input 
            id="website"
            name="website"  // Added name attribute
            placeholder="www.fashionbrand.com" 
            type="url"
            className="bg-background/50" 
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-6">
          <Label htmlFor="message">Tell us about your needs</Label>
          <textarea
            id="message"
            name="message"  // Added name attribute
            placeholder="What are your main challenges with online clothing sales?"
            className="min-h-[100px] w-full rounded-md border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </LabelInputContainer>

        {submitStatus.type && (
          <div className={cn(
            "p-4 mb-4 rounded-md",
            submitStatus.type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {submitStatus.message}
          </div>
        )}

        <button
          className={cn(
            "bg-primary relative group/btn w-full text-primary-foreground rounded-md h-12 font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
          type="submit"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Submitting...' : 'Request Demo'}</span>
          <SendIcon className="h-4 w-4" />
          <BottomGradient />
        </button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Trusted by leading fashion retailers worldwide</span>
            </div>
          </div>
        </form>
      
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-accent to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default Contact;