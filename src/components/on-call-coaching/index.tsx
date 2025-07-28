import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, AlertCircle, Loader2, RefreshCw } from "lucide-react";

const PhoneCallComponent = () => {
  const [salesAgentNumber, setSalesAgentNumber] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSid, setCallSid] = useState("");
  const [talkingPoints, setTalkingPoints] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const intervalRef = useRef(null);

  // Flask API base URL - change this for production
  // Flask API base URL - change this for production
const getApiUrl = () => {
  // 1. Environment variable (highest priority)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // 2. Development (localhost)
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001';
  }
  
  // 3. GitHub Codespaces
  if (window.location.hostname.includes('github.dev')) {
    return 'https://shiny-journey-4px597q46ph5794-5001.app.github.dev';
  }
  
  // 4. Production (default)
  return 'https://consuelooncallcoaching-production.up.railway.app';
};

const API_BASE_URL = getApiUrl();
  const toE164 = (phoneNumber) => {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Add +1 for US numbers if not already present
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`;
    }
    return `+${cleaned}`;
  };

 const initiateCall = async () => {
  setError('');
  setLoading(true);

  const apiUrl = `${API_BASE_URL}/make_call`;
  console.log("Attempting to call API at:", apiUrl); // <-- Add this line

  try {
    const response = await fetch(`${API_BASE_URL}/make_call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sales_agent_number: toE164(salesAgentNumber),  // Convert to E.164
        customer_number: toE164(customerNumber),        // Convert to E.164
      }),
    });

    const data = await response.json();

      if (data.success) {
        setIsCallActive(true);
        setCallSid(data.call_sid);
        startPollingTalkingPoints();
      } else {
        setError(data.error || "Failed to initiate call");
      }
    } catch (err) {
      setError("Failed to connect to API");
      console.error("Call initiation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startPollingTalkingPoints = () => {
    // Immediately fetch talking points
    fetchTalkingPoints();

    // Then poll every 3 seconds
    intervalRef.current = setInterval(() => {
      fetchTalkingPoints();
    }, 3000);
  };

  const fetchTalkingPoints = async () => {
    try {
      setIsLoadingPoints(true);
      const response = await fetch(`${API_BASE_URL}/talking_points`);
      const data = await response.json();

      if (data.success && data.talking_points) {
        setTalkingPoints(data.talking_points);
      }
    } catch (err) {
      console.error("Failed to fetch talking points:", err);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const endCall = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/end_call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          call_sid: callSid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCallActive(false);
        setCallSid("");
        setTalkingPoints(null);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setError(data.error || "Failed to end call");
      }
    } catch (err) {
      setError("Failed to end call");
      console.error("End call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");

    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else {
      return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneInput = (value, setter) => {
    const formatted = formatPhoneNumber(value);
    setter(formatted);
  };

  const refreshTalkingPoints = () => {
    fetchTalkingPoints();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">
            AI Sales Call Coach
          </h1>
          <p className="text-slate-600">
            Real-time AI guidance for your sales conversations
          </p>
        </div>

        {/* Phone Form */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Start Conference Call
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sales Agent Number
              </label>
              <input
                type="tel"
                value={salesAgentNumber}
                onChange={(e) =>
                  handlePhoneInput(e.target.value, setSalesAgentNumber)
                }
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCallActive}
              />
              <p className="mt-1 text-xs text-slate-500">
                Your phone number - you'll receive the call first
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Number
              </label>
              <input
                type="tel"
                value={customerNumber}
                onChange={(e) =>
                  handlePhoneInput(e.target.value, setCustomerNumber)
                }
                placeholder="(555) 987-6543"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCallActive}
              />
              <p className="mt-1 text-xs text-slate-500">
                Customer's phone number - they'll be connected after you answer
              </p>
            </div>

            <button
              onClick={isCallActive ? endCall : initiateCall}
              disabled={
                loading ||
                (!isCallActive && (!salesAgentNumber || !customerNumber))
              }
              className={`flex w-full transform items-center justify-center gap-3 rounded-lg px-6 py-4 font-medium transition-all hover:scale-[1.02] ${
                isCallActive
                  ? "bg-red-600 text-white shadow-lg hover:bg-red-700"
                  : "bg-blue-600 text-white shadow-lg hover:bg-blue-700 disabled:transform-none disabled:cursor-not-allowed disabled:bg-slate-300"
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isCallActive ? (
                <>
                  <PhoneOff className="h-5 w-5" />
                  End Call
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  Start Call
                </>
              )}
            </button>
          </div>

          {isCallActive && callSid && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-green-800">
                    Call Active
                  </p>
                </div>
                <p className="text-xs text-green-600">
                  ID: {callSid.slice(-8)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Talking Points Display */}
        {isCallActive && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                AI Coaching Points
              </h2>
              <button
                onClick={refreshTalkingPoints}
                disabled={isLoadingPoints}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingPoints ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {talkingPoints ? (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 font-medium text-slate-700">
                    Current Guidance:
                  </h3>
                  <div className="space-y-3">
                    {talkingPoints.points.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                          {index + 1}
                        </span>
                        <span className="text-slate-800">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {talkingPoints.reasoning && (
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="mb-2 font-medium text-slate-700">
                      Strategy Insight:
                    </h3>
                    <p className="rounded-lg bg-slate-50 p-3 italic text-slate-600">
                      {talkingPoints.reasoning}
                    </p>
                  </div>
                )}

                {talkingPoints.timestamp && (
                  <div className="text-right text-xs text-slate-500">
                    Last updated:{" "}
                    {new Date(talkingPoints.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="space-y-3">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-slate-500">
                    Generating AI coaching points...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call Flow Explanation */}
        {!isCallActive && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-3 font-semibold text-slate-800">How it works:</h3>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">1.</span>
                <span>
                  Enter your phone number and the customer's phone number
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">2.</span>
                <span>Click "Start Call" - you'll receive a call first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">3.</span>
                <span>
                  Answer the call, then the customer will be connected
                  automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">4.</span>
                <span>
                  AI will provide real-time coaching points throughout the
                  conversation
                </span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallComponent;
