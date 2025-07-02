import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, AlertCircle } from 'lucide-react';

const PhoneCallComponent = () => {
  const [salesAgentNumber, setSalesAgentNumber] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSid, setCallSid] = useState('');
  const [talkingPoints, setTalkingPoints] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Use environment variable that works in both dev and prod
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://34a0-2600-4041-4558-5000-1832-db31-138e-76fe.ngrok-free.app';

  const initiateCall = async () => {
    setError('');
    setLoading(true);

    // Convert formatted numbers to +1XXXXXXXXXX format
    const cleanNumber = (formatted) => {
      const digits = formatted.replace(/\D/g, '');
      return digits.length === 10 ? `+1${digits}` : `+${digits}`;
    };

    try {
      const response = await fetch(`${API_BASE_URL}/make_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_agent_number: cleanNumber(salesAgentNumber),
          customer_number: cleanNumber(customerNumber),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCallActive(true);
        setCallSid(data.call_sid);
        startPollingTalkingPoints();
      } else {
        setError(data.error || 'Failed to initiate call');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const startPollingTalkingPoints = () => {
    // Poll every 2 seconds for talking points
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/talking_points`);
        const data = await response.json();

        if (data.success) {
          setTalkingPoints(data.talking_points);
        }
      } catch (err) {
        console.error('Failed to fetch talking points:', err);
      }
    }, 2000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallSid('');
    setTalkingPoints(null);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Call Dashboard</h1>
        
        {/* Phone Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Initiate Call</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Agent Number
              </label>
              <input
                type="tel"
                value={salesAgentNumber}
                onChange={(e) => handlePhoneInput(e.target.value, setSalesAgentNumber)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCallActive}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Number
              </label>
              <input
                type="tel"
                value={customerNumber}
                onChange={(e) => handlePhoneInput(e.target.value, setCustomerNumber)}
                placeholder="(555) 987-6543"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCallActive}
              />
            </div>

            <button
              onClick={isCallActive ? endCall : initiateCall}
              disabled={loading || (!isCallActive && (!salesAgentNumber || !customerNumber))}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isCallActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {isCallActive ? (
                <>
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  {loading ? 'Connecting...' : 'Call'}
                </>
              )}
            </button>
          </div>

          {isCallActive && callSid && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">Call Active • SID: {callSid}</p>
            </div>
          )}
        </div>

        {/* Talking Points Display */}
        {isCallActive && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">AI Talking Points</h2>
            
            {talkingPoints ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Current Points:</h3>
                  <ul className="space-y-2">
                    {talkingPoints.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium mt-0.5">•</span>
                        <span className="text-gray-800">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {talkingPoints.reasoning && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-1">AI Reasoning:</h3>
                    <p className="text-gray-600 text-sm italic">{talkingPoints.reasoning}</p>
                  </div>
                )}

                {talkingPoints.timestamp && (
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(talkingPoints.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
                <p className="text-gray-500 mt-4 text-sm">Waiting for talking points...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallComponent;