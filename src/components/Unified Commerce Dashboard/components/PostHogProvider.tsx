"use client";

import React, { useEffect, useState } from "react";
import { posthog } from "../lib/posthog";

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onAccept,
  onDecline,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-gray-700">
          We use analytics to improve your experience. Session recordings help
          us understand how you use our dashboard.
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if consent was previously given
    const storedConsent = localStorage.getItem("posthog-consent");
    if (storedConsent !== null) {
      setConsentGiven(storedConsent === "true");
    }
  }, []);

  useEffect(() => {
    if (consentGiven === true) {
      posthog.opt_in_capturing();
    } else if (consentGiven === false) {
      posthog.opt_out_capturing();
    }
  }, [consentGiven]);

  const handleAccept = () => {
    localStorage.setItem("posthog-consent", "true");
    setConsentGiven(true);
  };

  const handleDecline = () => {
    localStorage.setItem("posthog-consent", "false");
    setConsentGiven(false);
  };

  return (
    <>
      {children}
      {consentGiven === null && (
        <ConsentBanner onAccept={handleAccept} onDecline={handleDecline} />
      )}
    </>
  );
}
