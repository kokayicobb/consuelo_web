"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { getUserSession } from "@/lib/getSession";
import { isTokenExpired } from "@/lib/isTokenExpired";
import { supabase } from "@/lib/supabaseHelper";

import { useAuth } from "@/lib/authContext";
import { Router } from "lucide-react";

const SignInOutButtons = () => {
  const { session, setSession } = useAuth();
  const [isUserExpired, setIsUserExpired] = useState<boolean>(false);
  const [isSignIn, setIsSignIn] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async (): Promise<void> => {
      const userSession = await getUserSession();
      setSession(userSession);
      setIsUserExpired(isTokenExpired(userSession?.expires_at));
    }

    fetchSession();
  }, [setSession]);


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        return;
    }

    setSession(null);
    setIsUserExpired(true);
  }

  return (
    <>
      { (session) ? ( 
        <Button className="rounded-full" onClick={signOut}>
          Sign Out
        </Button>
      ) : (
        <>
          <Link href="/signin">
            <Button variant={!isSignIn ? "default" : "ghost"} className="rounded-full" onClick={() => setIsSignIn(false)}>
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant={isSignIn ? "default" : "ghost"} className="rounded-full" onClick={() => setIsSignIn(true)}>Sign Up</Button>
          </Link>
        </>
      )}
    </>
  );
}

export default SignInOutButtons;