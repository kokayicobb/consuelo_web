'use client'

import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Building2, Zap, SendIcon } from 'lucide-react';

import { useFormState, useFormStatus } from "react-dom";
import { submitContactForm } from "./SubmitContactForm";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-primary relative group/btn w-full text-primary-foreground rounded-md h-12 font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
      type="submit"
      disabled={pending}
    >
      <span>{pending ? "Submitting..." : "Join Waitlist"}</span>
      <SendIcon className="h-4 w-4" />
      <BottomGradient />
    </button>
  );
}

export function Contact() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  return (
    <div className="w-full bg-gradient-to-b from-background to-background/80 py-40 sm:py-48">
      {/* Header with consuelo text */}
      <div className="fixed left-8 top-16 z-50">
        <span className="text-2xl font-semibold">
          consuelo
        </span>
      </div>
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="mx-auto text-center mb-8">
         
    
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Pre Launch</span>{" "}
            <span className="text-primary">Waitlist.</span>
          </h2>
        </div>
    
        <div className="max-w-xl w-full mx-auto rounded-xl p-6 md:p-8 shadow-input bg-card">
          <div className="flex items-center gap-3 mb-4">
            <img src="/apple-touch-icon.png" alt="Consuelo Logo" className="w-10 h-10" />
            <h2 className="font-bold text-2xl text-card-foreground">
              Support our Product Hunt launch.
            </h2>
          </div>
        
          <p className="text-muted-foreground text-base mt-2">
            Hire AI employees for your existing work applications, reliably and finally in one place. No code. Fully Customizable.
          </p>

          <form className="mt-8" action={formAction}>
            <div className="flex flex-col space-y-4 mb-4">
              {/* <LabelInputContainer>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Jane Smith" 
                  type="text"
                  className="bg-background/50 text-base border border-slate-300"
                  required
                />
              </LabelInputContainer> */}
              {/* <LabelInputContainer>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  name="company"
                  placeholder="Fashion Brand Inc." 
                  type="text"
                 className="bg-background/50 text-base border border-slate-300"
                  required
                />
              </LabelInputContainer> */}
            </div>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                placeholder="Enter your email address" 
                type="email"
                className="bg-background/50 text-base shadow-[0px_0px_2px_2px_var(--slate-500)]"
                style={{ border: '2px solid rgb(203 213 225)' }}
                disableHover={false}
                required
              />
            </LabelInputContainer>

            {/* <LabelInputContainer className="mb-4">
              <Label htmlFor="website">Company Website (Optional)</Label>
              <Input 
                id="website" 
                name="website"
                placeholder="www.fashionbrand.com" 
                type="url"
               className="bg-background/50 text-base"
              />
            </LabelInputContainer> */}

            {/* <LabelInputContainer className="mb-6">
              <Label htmlFor="message">Tell us about your needs</Label>
              <textarea
                id="message"
                name="message"
                placeholder="What are your main challenges with online clothing sales?"
                className="min-h-[100px] w-full rounded-md border bg-background/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                required
              />
            </LabelInputContainer> */}

            <SubmitButton />

            {state.message && (
              <p className={`mt-4 text-sm ${state.message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                {state.message}
              </p>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                {/* <Building2 className="w-4 h-4" /> */}
                <span>consuelo is on the job.</span>
              </div>
            </div>
          </form>
        </div>
      </div>
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

