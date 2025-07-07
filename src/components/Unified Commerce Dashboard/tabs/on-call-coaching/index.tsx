import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const PhoneCallComponent = () => {
  const [salesAgentNumber, setSalesAgentNumber] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSid, setCallSid] = useState('');
  const [talkingPoints, setTalkingPoints] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const intervalRef = useRef(null);

  const initiateCall = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_agent_number: salesAgentNumber,
          customer_number: customerNumber,
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
      console.error('Call initiation error:', err);
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
      const response = await fetch(`/api/talking-points${callSid ? `?call_sid=${callSid}` : ''}`);
      const data = await response.json();

      if (data.success && data.talking_points) {
        setTalkingPoints(data.talking_points);
      }
    } catch (err) {
      console.error('Failed to fetch talking points:', err);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const endCall = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/end-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_sid: callSid,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsCallActive(false);
        setCallSid('');
        setTalkingPoints(null);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setError(data.error || 'Failed to end call');
      }
    } catch (err) {
      setError('Failed to end call');
      console.error('End call error:', err);
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
    const phoneNumber = value.replace(/\D/g, '');
    
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Sales Call Coach</h1>
          <p className="text-slate-600">Real-time AI guidance for your sales conversations</p>
        </div>
        
        {/* Phone Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Start Conference Call</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sales Agent Number
              </label>
              <input
                type="tel"
                value={salesAgentNumber}
                onChange={(e) => handlePhoneInput(e.target.value, setSalesAgentNumber)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isCallActive}
              />
              <p className="mt-1 text-xs text-slate-500">Your phone number - you'll receive the call first</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Number
              </label>
              <input
                type="tel"
                value={customerNumber}
                onChange={(e) => handlePhoneInput(e.target.value, setCustomerNumber)}
                placeholder="(555) 987-6543"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isCallActive}
              />
              <p className="mt-1 text-xs text-slate-500">Customer's phone number - they'll be connected after you answer</p>
            </div>

            <button
              onClick={isCallActive ? endCall : initiateCall}
              disabled={loading || (!isCallActive && (!salesAgentNumber || !customerNumber))}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
                isCallActive
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none shadow-lg'
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
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-green-800">Call Active</p>
                </div>
                <p className="text-xs text-green-600">ID: {callSid.slice(-8)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Talking Points Display */}
        {isCallActive && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">AI Coaching Points</h2>
              <button
                onClick={refreshTalkingPoints}
                disabled={isLoadingPoints}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingPoints ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {talkingPoints ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Current Guidance:</h3>
                  <div className="space-y-3">
                    {talkingPoints.points.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-slate-800">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {talkingPoints.reasoning && (
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="font-medium text-slate-700 mb-2">Strategy Insight:</h3>
                    <p className="text-slate-600 italic bg-slate-50 p-3 rounded-lg">{talkingPoints.reasoning}</p>
                  </div>
                )}

                {talkingPoints.timestamp && (
                  <div className="text-xs text-slate-500 text-right">
                    Last updated: {new Date(talkingPoints.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-slate-500 text-sm">Generating AI coaching points...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call Flow Explanation */}
        {!isCallActive && (
          <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">How it works:</h3>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">1.</span>
                <span>Enter your phone number and the customer's phone number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">2.</span>
                <span>Click "Start Call" - you'll receive a call first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">3.</span>
                <span>Answer the call, then the customer will be connected automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-slate-800">4.</span>
                <span>AI will provide real-time coaching points throughout the conversation</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallComponent;