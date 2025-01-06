import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X } from 'lucide-react';

const TryOnButton = ({ garmentImage, category, onResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [garmentBase64, setGarmentBase64] = useState(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(false);
  const attemptCountRef = useRef(0);

  // Constants for polling
  const MAX_POLL_ATTEMPTS = 60;
  const POLL_INTERVAL = 2000;
  const POLL_TIMEOUT = 120000;

  useEffect(() => {
    const loadGarmentImage = async () => {
      try {
        if (!garmentImage) {
          console.error('No garment image provided');
          return;
        }

        if (garmentImage.startsWith('data:') || garmentImage.startsWith('http')) {
          setGarmentBase64(garmentImage);
          return;
        }

        const response = await fetch(garmentImage);
        if (!response.ok) {
          throw new Error(`Failed to load garment image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          setGarmentBase64(reader.result);
        };
        
        reader.onerror = (error) => {
          console.error('Error reading garment image:', error);
          setError('Error loading garment image');
        };
        
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Error loading garment image:', err);
        setError('Error loading garment image. Please try again.');
      }
    };

    loadGarmentImage();
  }, [garmentImage]);
 // Update the pollStatus function too:
 const pollStatus = async (id) => {
  pollingRef.current = true;
  attemptCountRef.current = 0;

  const poll = async () => {
    attemptCountRef.current++;
    console.log(`Polling attempt ${attemptCountRef.current} for ID: ${id}`);

    try {
      const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        headers: {
          'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Status response:", data); // Add this log

      switch(data.status) {
        case "completed":
          if (data.output && data.output.length > 0) {
            console.log("Processing completed successfully. Result:", data.output[0]);
            setResult(data.output[0]);
            if (onResult) onResult(data.output[0]);
            setIsLoading(false);
            pollingRef.current = false;
          } else {
            throw new Error("Processing completed, but no output was provided.");
          }
          break;

        case "failed":
          throw new Error(data.error?.message || "Processing failed on the server.");
          
        case "processing":
        case "in_queue":
        case "starting":
          console.log(`Status: ${data.status}. Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await poll(); // Recursive call to continue polling
          break;

        default:
          console.log(`Unknown status: ${data.status}`);
          throw new Error(`Unknown status: ${data.status}`);
      }

    } catch (err) {
      console.error("Error during polling:", err);
      setError(err.message || "An unexpected error occurred during polling.");
      setIsLoading(false);
      pollingRef.current = false;
    }
  };

  try {
    await poll();
  } catch (error) {
    console.error("Polling failed:", error);
    setError("Failed to get processing status");
    setIsLoading(false);
    pollingRef.current = false;
  }
};
  
  

const handleTryOn = async () => {
  if (!userImage || !garmentBase64) {
    setError('Please ensure both your photo and garment image are loaded');
    return;
  }

  setIsLoading(true);
  setError(null);
  setResult(null);
  pollingRef.current = true;

  try {
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(userImage);
    });

    console.log('Initiating try-on request');
    const response = await fetch('https://api.fashn.ai/v1/run', { // Changed to direct FASHN API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB' // Replace with your actual FASHN API key
      },
      body: JSON.stringify({
        model_image: base64Image,
        garment_image: garmentBase64,
        category: category,
        mode: 'balanced',
        num_samples: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Try-on API response:', data);

    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    if (!data.id) {
      throw new Error('No prediction ID received');
    }

    await pollStatus(data.id);
  } catch (err) {
    console.error('Try-on error:', err);
    setError(`Error: ${err.message}`);
    setIsLoading(false);
    pollingRef.current = false;
  }
};

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImagePreview(reader.result);
      setUserImage(file);
      setError(null);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUserImage(null);
    setUserImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const fashionFacts = [
    "Did you know? The first fashion magazine was published in Germany in 1586!",
    "High heels were originally worn by Persian horsemen in the 10th century to keep their feet in stirrups.",
    "The concept of 'ready-to-wear' clothing didn't exist until the Industrial Revolution in the 19th century.",
    "Buttons were originally used as decorative ornaments rather than fasteners - buttonholes weren't invented until the 13th century.",
    "The little black dress became iconic after Coco Chanel published a simple calf-length black dress in Vogue in 1926.",
    "The word 'denim' comes from the French phrase 'serge de Nîmes', referring to the city where the fabric was first made.",
    "Before the 1920s, pink was considered a masculine color while blue was viewed as more feminine."
  ];
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          ref={fileInputRef}
          disabled={isLoading}
        />
        
        {!userImagePreview ? (
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 flex flex-col items-center justify-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <Camera className="w-8 h-8" />
            <span>Upload Your Photo</span>
            <span className="text-sm text-gray-500">Click to browse</span>
          </Button>
        ) : (
          <div className="relative">
            <img 
              src={userImagePreview} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 rounded-full"
              size="icon"
              variant="destructive"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Button 
        onClick={handleTryOn} 
        disabled={isLoading || !userImage || !garmentBase64}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Try On Now'}
      </Button>

   

{isLoading && (
  <div className="mt-4 text-center space-y-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Try-on AI is processing your image... This typically takes 10-13 seconds depending on your connection speed.
      </p>
      <p className="mt-4 text-sm italic text-gray-500">
        While you wait, here's an interesting fashion fact:
      </p>
      <p className="text-sm text-gray-700 max-w-md mx-auto">
        {fashionFacts[Math.floor(Math.random() * fashionFacts.length)]}
      </p>
    </div>
  </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="mt-4">
          <img 
            src={result} 
            alt="Try-on result preview" 
            className="w-full rounded-lg shadow-lg"
            onLoad={() => {
              console.log('Result image loaded successfully');
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error('Error loading result image');
              setError('Error loading result image');
              setIsLoading(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TryOnButton;