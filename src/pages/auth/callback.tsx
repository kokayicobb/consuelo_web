import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Get URL hash (fragment)
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error during OAuth callback:", error);
        router.push("/login?error=oauth");
      } else if (data?.session) {
        // Success, redirect to dashboard
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Processing authentication...</p>
        <p className="text-sm text-gray-500">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}
