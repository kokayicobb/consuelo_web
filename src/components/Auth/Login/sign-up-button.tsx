"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/" });  // This will open the auth modal
  };

  return (
    <Button 
      className="w-full" 
      variant="outline"
      onClick={handleSignIn}
    >
      Sign In
    </Button>
  );
}