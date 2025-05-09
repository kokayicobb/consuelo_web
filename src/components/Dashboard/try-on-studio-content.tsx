"use client";

import type React from "react";

import { useState } from "react";
import { Upload, ArrowLeftRight, ImageIcon, Play, Info, Shuffle, Download } from 'lucide-react'; 
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// Add custom animation
const animationStyles = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(var(--accent), 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(var(--accent), 0); }
    100% { box-shadow: 0 0 0 0 rgba(var(--accent), 0); }
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
`;

export default function TryOnStudioContent() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("top");
  const [quality, setQuality] = useState<string>("balanced");
  const [samples, setSamples] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setModelImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGarmentImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mapCategory = (uiCategory) => {
    const categoryMap = {
      'top': 'tops',
      'bottom': 'bottoms',
      'fullbody': 'one-pieces'
    };
    return categoryMap[uiCategory] || 'tops'; // Default to tops if mapping not found
  };
 // Update your handleTryOn function and pollForResults to directly call the FASHN API
// This bypasses any middleware issues with your server

const handleTryOn = async () => {
  if (!modelImage || !garmentImage) return;

  setIsLoading(true);
  setResultImage(null);

  try {
    // Ensure images are properly encoded as base64 if they aren't already
    let modelBase64 = modelImage;
    let garmentBase64 = garmentImage;

    // Log what we're sending for debugging
    console.log('Category being sent:', mapCategory(category));
    console.log('Model image type:', typeof modelBase64);
    console.log('Garment image type:', typeof garmentBase64);
    
   
    // Direct API call to FASHN
    console.log('Sending direct request to FASHN API');
    
    const payload = {
      model_image: modelBase64,
      garment_image: garmentBase64,
      category: mapCategory(category),
      mode: quality,
      num_samples: samples
    };
    
    console.log('Request payload structure:', {
      ...payload,
      model_image: `${modelBase64.substring(0, 20)}... (truncated)`,
      garment_image: `${garmentBase64.substring(0, 20)}... (truncated)`
    });
    
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FASHN API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('FASHN API response:', data);
    
    const predictionId = data.id;

    if (!predictionId) {
      throw new Error('No prediction ID returned from API');
    }

    console.log('Received prediction ID:', predictionId);
    
    // Poll for results directly from FASHN API
    await pollForResultsDirect(predictionId);
  } catch (error) {
    console.error('Error during try-on process:', error);
    setIsLoading(false);
  }
};

const pollForResultsDirect = async (predictionId) => {
  const maxAttempts = 60;
  let attempts = 0;

  const checkStatus = async () => {
    try {
      console.log(`Polling attempt ${attempts + 1} for ID: ${predictionId}`);
      
      const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'
        }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('FASHN Status API error:', errorText);
        throw new Error(`Status API error: ${statusResponse.status} - ${errorText}`);
      }

      const statusData = await statusResponse.json();
      console.log('FASHN Status full response:', JSON.stringify(statusData, null, 2));
      
      // Check the status
      switch (statusData.status) {
        case 'completed':
          if (statusData.output && statusData.output.length > 0) {
            const resultImageUrl = statusData.output[0];
            console.log('COMPLETED - Setting result image URL:', resultImageUrl);
            
            // Add a cache buster to ensure we're not getting a cached version
            const cacheBuster = `?t=${Date.now()}`;
            setResultImage(resultImageUrl + cacheBuster);
            
            // Verify image is loading
            const testImg = new Image();
            testImg.onload = () => console.log('Image verified to load correctly:', resultImageUrl);
            testImg.onerror = (e) => console.error('Image failed to load:', e);
            testImg.src = resultImageUrl + cacheBuster;
            
            setIsLoading(false);
            return;
          } else {
            throw new Error('Processing completed but no output was provided');
          }
          
        case 'failed':
          console.error('Processing failed:', statusData.error);
          throw new Error(statusData.error?.message || 'Processing failed');
          
        case 'processing':
        case 'in_queue':
        case 'starting':
          // Continue polling
          console.log(`Status is ${statusData.status}, continuing to poll...`);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2000); // Check every 2 seconds
          } else {
            throw new Error('Timed out waiting for result');
          }
          break;
          
        default:
          throw new Error(`Unknown status: ${statusData.status}`);
      }
    } catch (error) {
      console.error('Error checking try-on status:', error);
      setIsLoading(false);
    }
  };

  checkStatus();
};
  const resetImages = () => {
    setModelImage(null);
    setGarmentImage(null);
    setResultImage(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragActive(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };
  const handleSaveImage = (e) => {
  if (e) e.preventDefault(); // Prevent any default navigation
  
  if (!resultImage) return;

  const link = document.createElement('a');
  link.href = resultImage;
  link.download = 'virtual-try-on-result.png'; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragActive(null);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'model') {
          setModelImage(e.target?.result as string);
        } else {
          setGarmentImage(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Add the animation styles to the document
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
    {/* Main Content */}
    <div className="flex flex-1 flex-col p-2">
      {/* Top Row with Upload Sections */}
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Model Upload */}
        <motion.div 
          className="overflow-hidden rounded-lg border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-white">
                Select Model
              </span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <motion.button 
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>

            <div 
              className="flex min-h-48 md:min-h-52 flex-col items-center justify-center p-2" // <-- MODIFIED HERE
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, 'model')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'model')}
            >
              {!modelImage ? (
                <div className={`flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed ${dragActive === 'model' ? 'border-accent bg-accent/10 scale-[0.98]' : 'border-border'} transition-all duration-200`}>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                  </motion.div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Paste/drop image here
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">OR</p>
                  <motion.button
                    onClick={() =>
                      document.getElementById("model-upload")?.click()
                    }
                    className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-white hover:bg-muted/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-4 w-4" />
                    Choose file
                  </motion.button>
                  <input
                    id="model-upload"
                    type="file"
                    className="hidden"
                    onChange={handleModelUpload}
                    accept="image/*"
                  />
                </div>
              ) : (
                <motion.div 
                  className="relative h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={modelImage || "/placeholder.svg"}
                    alt="Model"
                    className="h-full w-full rounded-md object-cover"
                  />
                  <motion.button
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setModelImage(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <div className="p-2">
              <motion.button 
                className="flex w-full items-center justify-center gap-1 rounded-md border border-border bg-card py-2 text-sm text-white hover:bg-muted/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="h-4 w-4" />
                Generate AI Model
              </motion.button>
            </div>
          </motion.div>

          {/* Garment Upload */}
          <motion.div 
            className="overflow-hidden rounded-lg border border-border bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">
                  Select Garment
                </span>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <motion.button 
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>

            <div 
              className="flex min-h-48 md:min-h-52 flex-col items-center justify-center p-2" 
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, 'garment')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'garment')}
            >
              {!garmentImage ? (
                <div className={`flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed ${dragActive === 'garment' ? 'border-accent bg-accent/10 scale-[0.98]' : 'border-border'} transition-all duration-200`}>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                  </motion.div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Paste/drop image here
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">OR</p>
                  <motion.button
                    onClick={() =>
                      document.getElementById("garment-upload")?.click()
                    }
                    className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-white hover:bg-muted/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-4 w-4" />
                    Choose file
                  </motion.button>
                  <input
                    id="garment-upload"
                    type="file"
                    className="hidden"
                    onChange={handleGarmentUpload}
                    accept="image/*"
                  />
                </div>
              ) : (
                <motion.div 
                  className="relative h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={garmentImage || "/placeholder.svg"}
                    alt="Garment"
                    className="h-full w-full rounded-md object-cover"
                  />
                  <motion.button
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setGarmentImage(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <div className="p-2">
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5 text-sm text-white">
                  Category
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <motion.button
                    className={`border ${category === "top" ? "border-accent bg-muted/20" : "border-border"} flex flex-col items-center rounded-md py-1.5 text-xs text-white`}
                    onClick={() => setCategory("top")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="mb-1 h-10 w-10"
                      fill={
                        category === "top"
                          ? "hsl(var(--accent))"
                          : "currentColor"
                      }
                    >
                      <g data-name="Layer 89">
                        <path d="M77.361,20.145c-3.424-2.542-17-5.653-17.58-5.784a.967.967,0,0,0-.609.074c-.016,0-.033-.007-.049,0a20.579,20.579,0,0,1-18.183.035c-.01-.006-.022,0-.032,0a.977.977,0,0,0-.691-.107c-.577.131-14.156,3.242-17.58,5.784-4.335,3.217-11.487,49.05-12.877,58.2a1,1,0,0,0,.819,1.136l9.75,1.668a1.016,1.016,0,0,0,.17.015,1,1,0,0,0,.964-.737l7.951-29.249V84.665a1,1,0,0,0,1,1H69.584a1,1,0,0,0,1-1V51.181L78.535,80.43a1,1,0,0,0,.964.737,1.016,1.016,0,0,0,.17-.015l9.75-1.668a1,1,0,0,0,.819-1.136C88.849,69.194,81.7,23.361,77.361,20.145Zm-19.3-3.084a8.429,8.429,0,0,1-8.024,5.985c-.013,0-.025.006-.039.006s-.028-.007-.042-.006a8.446,8.446,0,0,1-8-5.92,22.374,22.374,0,0,0,7.98,1.471A22.63,22.63,0,0,0,58.065,17.061ZM80.227,79.028,70.584,43.557V35.788a1,1,0,0,0-2,0V83.665H31.416V35.788a1,1,0,0,0-2,0v7.769L19.773,79.028l-7.887-1.35C15.851,51.759,21.333,23.6,23.83,21.75,26.2,19.993,35.3,17.582,39.678,16.54a10.6,10.6,0,0,0,10.277,8.5h.091a10.606,10.606,0,0,0,10.277-8.5C64.7,17.582,73.8,19.993,76.17,21.75c2.5,1.854,7.979,30.009,11.943,55.929Z" />
                        <path d="M59.978,36.964h-6.9l-2.131-6.558a1,1,0,0,0-1.9,0l-2.131,6.558h-6.9a1,1,0,0,0-.588,1.809l5.578,4.054-2.13,6.559A1,1,0,0,0,44.422,50.5L50,46.449,55.578,50.5a1,1,0,0,0,1.539-1.117l-2.13-6.559,5.578-4.054a1,1,0,0,0-.588-1.809Zm-6.754,4.672a1,1,0,0,0-.363,1.117l1.4,4.322L50.588,44.4a1,1,0,0,0-1.176,0l-3.677,2.671,1.4-4.322a1,1,0,0,0-.363-1.117L43.1,38.964h4.545a1,1,0,0,0,.951-.691L50,33.951l1.4,4.321a1,1,0,0,0,.951.691H56.9Z" />
                      </g>
                    </svg>
                    Top
                  </motion.button>
                  <motion.button
                    className={`border ${category === "bottom" ? "border-accent bg-muted/20" : "border-border"} flex flex-col items-center rounded-md py-1.5 text-xs text-white`}
                    onClick={() => setCategory("bottom")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="mb-1 h-10 w-10"
                      fill={
                        category === "bottom"
                          ? "hsl(var(--accent))"
                          : "currentColor"
                      }
                    >
                      <path d="M73.4130859,10H26.5869141c-0.5107422,0-0.9389648,0.3847656-0.9941406,0.8920898l-7.8144531,72.0258789  c-0.0532227,0.4902344,0.2587891,0.9462891,0.7353516,1.0737305l22.2802734,5.9741211  c0.2675781,0.0727539,0.5566406,0.0283203,0.7924805-0.1201172c0.2358398-0.1489258,0.3989258-0.3896484,0.449707-0.6640625  L50,46.1245117l7.9638672,43.0571289c0.0507812,0.2744141,0.2138672,0.5151367,0.449707,0.6640625  C58.574707,89.9472656,58.7602539,90,58.9472656,90c0.0864258,0,0.1738281-0.0112305,0.2587891-0.0341797l22.2802734-5.9741211  c0.4765625-0.1274414,0.7885742-0.5834961,0.7353516-1.0737305l-7.8144531-72.0258789  C74.3520508,10.3847656,73.9238281,10,73.4130859,10z M74.7312012,32.4202881  c-8.4484863-0.647522-9.9647217-8.5980835-10.2355347-11.4647217h8.9916382L74.7312012,32.4202881z M72.515625,12  l0.7546997,6.9555664H26.7296753L27.484375,12H72.515625z M26.5126953,20.9555664h8.9916382  c-0.270813,2.8666382-1.7870483,10.8171997-10.2355347,11.4647217L26.5126953,20.9555664z M40.2661133,87.7539062  l-20.4072266-5.472168l0.9544067-8.7964478l21.1531372,5.0758057L40.2661133,87.7539062z M50,39.6264648  c-0.4819336,0-0.8955078,0.3442383-0.9833984,0.8183594l-6.6859741,36.1472778l-21.2998657-5.1109619l4.0195312-37.0467529  c10.3418579-0.5400391,12.1404419-10.2926636,12.4492188-13.4788208h25.0009766  c0.3087769,3.1861572,2.1073608,12.9387817,12.4492188,13.4788208l4.0169067,37.022522L57.664917,76.5682373l-6.6815186-36.1234131  C50.8955078,39.9707031,50.4819336,39.6264648,50,39.6264648z M59.7338867,87.7539062l-1.7047729-9.2167358l21.1549683-5.0760498  l0.9570312,8.8206177L59.7338867,87.7539062z" />
                    </svg>
                    Bottom
                  </motion.button>

                  <motion.button
                    className={`border ${category === "fullbody" ? "border-accent bg-muted/20" : "border-border"} flex flex-col items-center rounded-md py-1.5 text-xs text-white`}
                    onClick={() => setCategory("fullbody")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="mb-1 h-10 w-10"
                      fill={
                        category === "fullbody"
                          ? "hsl(var(--accent))"
                          : "currentColor"
                      }
                    >
                      <g data-name="Layer 34">
                        <path d="M24.109,98H75.891L65.244,41.215V38.073L68.23,17.108a6.33,6.33,0,0,0-2.8-6.245l-.184-.126V2H58.892V7.411c-.2-.019-.407-.029-.62-.029a6.428,6.428,0,0,0-5.353,2.86,3.525,3.525,0,0,1-5.848-.009,6.428,6.428,0,0,0-5.963-2.8V2H34.756v8.737l-.155.107a6.342,6.342,0,0,0-2.831,6.264l2.986,20.965v3.142Zm48.272-2.909H27.619l9.794-52.257H62.587ZM37.665,39.925v-.533h24.67v.533ZM61.8,4.909h.534V8.788l-.495-.34c-.01-.009-.029-.019-.039-.029Zm-24.136,0H38.2v3.51a.209.209,0,0,1-.049.039l-.485.33ZM34.65,16.691a3.406,3.406,0,0,1,1.493-3.365l.873-.591,2.763-1.862a1.311,1.311,0,0,1,.272-.155l1.057-.3v-.058a3.473,3.473,0,0,1,3.539,1.474,6.423,6.423,0,0,0,10.7.009,3.529,3.529,0,0,1,2.929-1.551,3.333,3.333,0,0,1,.64.058v.058l1.037.311a1.178,1.178,0,0,1,.272.145l2.763,1.872.252.164.737.5a3.443,3.443,0,0,1,1.377,3.3L62.528,36.482H37.472Z" />
                      </g>
                    </svg>
                    Full-body
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Result */}
          <motion.div 
            className="overflow-hidden rounded-lg border border-border bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            ref={resultRef}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-medium text-white">Result</span>
              <Link href="#" className="flex items-center text-xs text-accent hover:underline">
                <motion.span 
                  className="mr-1"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: 3, duration: 0.5, delay: 1 }}
                >
                  📹
                </motion.span>
                Watch 2-Minute Tutorial
              </Link>
            </div>

        
               <div 
               className="flex min-h-48 md:min-h-52 flex-col items-center justify-center p-2" >
              {isLoading ? (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 h-full w-full animate-spin rounded-full border-4 border-t-accent border-l-accent border-r-transparent border-b-transparent"></div>
                    <div className="absolute inset-2 h-8 w-8 animate-spin rounded-full border-4 border-r-accent border-b-accent border-l-transparent border-t-transparent animation-delay-200"></div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : resultImage ? (
                <motion.div 
                  className="relative h-full w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <img
                    src={resultImage || "/placeholder.svg"}
                    alt="Result"
                    className="h-full w-full rounded-md object-cover"
                  />
                  {showConfetti && (
                    <motion.div 
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-accent/20 rounded-md"></div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  </motion.div>
                </div>
              )}
            </div>

            <div className="p-2 flex gap-2">
              <motion.button
                onClick={handleTryOn}
                disabled={!modelImage || !garmentImage || isLoading}
                className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium
                  ${
                    !modelImage || !garmentImage || isLoading
                      ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                      : "bg-accent text-white hover:bg-accent/90"
                  }`}
                whileHover={!(!modelImage || !garmentImage || isLoading) ? { scale: 1.02, boxShadow: "0 0 10px rgba(var(--accent), 0.5)" } : {}}
                whileTap={!(!modelImage || !garmentImage || isLoading) ? { scale: 0.98 } : {}}
              >
                <Play className="h-4 w-4" />
                Run (~14s)
              </motion.button>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
      <Download className="h-4 w-4" />
      Right-click image to save
    </div>
              
            </div>
          </motion.div>
        </div>
{/* Bottom Settings Row */}
<div className="grid grid-cols-1 gap-2 md:grid-cols-5">
  <motion.div 
    className="rounded-lg border border-border bg-card p-3 md:col-span-3"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 1.2, 
      delay: 0.3,
      type: "spring",
      stiffness: 100,
      damping: 20
    }}
  >
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-white">Quality Settings</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <motion.button
          className={`border ${quality === "performance" ? "border-accent bg-muted/20" : "border-border"} flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-white overflow-hidden relative`}
          onClick={() => setQuality("performance")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 150,
            damping: 20
          }}
        >
          {quality === "performance" && (
            <motion.div 
              className="absolute inset-0 bg-accent/10"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 5.5, repeat: Infinity, repeatType: "mirror" }}
            />
          )}
          <span>⚡</span>
          Performance
        </motion.button>
        <motion.button
          className={`border ${quality === "balanced" ? "border-accent bg-muted/20" : "border-border"} flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-white overflow-hidden relative`}
          onClick={() => setQuality("balanced")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 150,
            damping: 20
          }}
        >
          {quality === "balanced" && (
            <motion.div 
              className="absolute inset-0 bg-accent/10"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 5.5, repeat: Infinity, repeatType: "mirror" }}
            />
          )}
          <span>⚖️</span>
          Balanced
        </motion.button>
        <motion.button
          className={`border ${quality === "quality" ? "border-accent bg-muted/20" : "border-border"} flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-white overflow-hidden relative`}
          onClick={() => setQuality("quality")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 150, 
            damping: 20
          }}
        >
          {quality === "quality" && (
            <motion.div 
              className="absolute inset-0 bg-accent/10"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 5.5, repeat: Infinity, repeatType: "mirror" }}
            />
          )}
          <span>💎</span>
          Quality
        </motion.button>
      </div>
    </div>
  </motion.div>


          <motion.div 
            className="rounded-lg border border-border bg-card p-3 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-white">Number of Samples</p>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.span 
                  className="text-sm text-white bg-accent/20 px-2 py-0.5 rounded-full"
                  key={samples}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {samples}
                </motion.span>
              </div>
              <div className="relative py-2">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={samples}
                  onChange={(e) => setSamples(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1 text-xs text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-white">Seed</p>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.button 
                  className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-white hover:bg-muted/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shuffle className="h-3 w-3" />
                  Random
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

     
    </div>
  );
}