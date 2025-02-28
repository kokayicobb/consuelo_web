// ConsuoloTryOn.js - A widget to add to e-commerce product pages

import React, { useState, useEffect } from 'react';

// Main Try-On Component
const ConsueloTryOn = ({ 
  apiKey, 
  productId, 
  productType = 'clothing', 
  productImage,
  productName,
  brandName,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [tryOnUrl, setTryOnUrl] = useState(null);

  // Verify the API key when component mounts
  useEffect(() => {
    if (!apiKey) {
      setError('API key is required');
      if (onError) onError('API key is required');
    }
  }, [apiKey, onError]);

  // Function to initialize try-on process
  const initiateTryOn = async () => {
    if (!apiKey || !productId) {
      setError('API key and product ID are required');
      if (onError) onError('API key and product ID are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the Consuelo API to initiate try-on
      const response = await fetch('https://www.consuelohq.com/api/try-on/initiate', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          productType,
          productImage,
          productName,
          brandName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate try-on');
      }

      const data = await response.json();
      
      // Store the try-on session URL
      setTryOnUrl(data.sessionUrl);
      
      // Open the try-on modal
      setIsTryOnModalOpen(true);
      
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
      if (onError) onError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Close the modal and reset
  const handleClose = () => {
    setIsTryOnModalOpen(false);
  };

  return (
    <div className="consuelo-try-on-container">
      {/* Try-On Button */}
      <button
        className="consuelo-try-on-button"
        onClick={initiateTryOn}
        disabled={isLoading || !apiKey}
        style={{
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: isLoading || !apiKey ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          opacity: isLoading || !apiKey ? 0.7 : 1
        }}
      >
        {isLoading ? (
          <>
            <SpinnerIcon /> Loading...
          </>
        ) : (
          <>
            <TryOnIcon /> Virtual Try-On
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div 
          className="consuelo-try-on-error"
          style={{
            color: '#DC2626',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {error}
        </div>
      )}

      {/* Try-On Modal */}
      {isTryOnModalOpen && tryOnUrl && (
        <TryOnModal url={tryOnUrl} onClose={handleClose} />
      )}
    </div>
  );
};

// Icons
const TryOnIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ marginRight: '8px' }}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SpinnerIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ 
      marginRight: '8px',
      animation: 'spin 1s linear infinite'
    }}
  >
    <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" opacity="1"></path>
    <style jsx>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);

// Modal Component
const TryOnModal = ({ url, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      className="consuelo-try-on-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="consuelo-try-on-modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div 
          className="consuelo-try-on-modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Virtual Try-On
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ height: 'calc(90vh - 80px)' }}>
          <iframe
            src={url}
            title="Consuelo Virtual Try-On"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="camera; microphone; accelerometer; gyroscope"
          />
        </div>
      </div>
    </div>
  );
};

export default ConsueloTryOn;