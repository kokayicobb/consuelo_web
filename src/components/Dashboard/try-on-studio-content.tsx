"use client"

import type React from "react"
import { useState } from "react"
import { Upload, ImageIcon, Play, Info, Shuffle, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useRef } from "react"

export default function TryOnStudioContent() {
  const [modelImage, setModelImage] = useState<string | null>(null)
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<string>("top")
  const [quality, setQuality] = useState<string>("balanced")
  const [samples, setSamples] = useState<number>(1)
  const [showBottomSection, setShowBottomSection] = useState(true)
  const resultRef = useRef<HTMLDivElement>(null)
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [showModelsModal, setShowModelsModal] = useState(false)
  const [selectedModelForPoses, setSelectedModelForPoses] = useState<string | null>(null)

  const modelsData = {
    lady1: {
      name: "Emma",
      gender: "female",
      defaultImage: "/model-swap/full-woman-1.png?height=400&width=300",
      poses: {
        "full-body": "/model-swap/full-woman-1.png?height=400&width=300",
        "3-4-body": "/model-swap/full-woman-1.5.png?height=400&width=300",
        "full-side": "/model-swap/side-woman-1.png?height=400&width=300",
        back: "/placeholder.svg?height=400&width=300",
      },
    },
    lady2: {
      name: "Sofia",
      gender: "female",
      defaultImage: "/model-swap/full-woman-3.png?height=400&width=300",
      poses: {
        "full-body": "/model-swap/full-woman-3.png?height=400&width=300",
        "3-4-body": "/model-swap/full-woman-3.5.png?height=400&width=300",
        "full-side": "/model-swap/side-woman-3.png?height=400&width=300",
        back: "/placeholder.svg?height=400&width=300",
      },
    },
    guy1: {
      name: "Marcus",
      gender: "male",
      defaultImage: "/model-swap/full-man-1.png?height=400&width=300",
      poses: {
        "full-body": "/model-swap/full-man-1.png?height=400&width=300",
        "3-4-body": "/model-swap/full-man-1.5.png?height=400&width=300",
        "full-side": "/model-swap/side-man-1.png?height=400&width=300",
        back: "/model-swap/back-man-1.png?height=400&width=300",
      },
    },
  }

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setModelImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setGarmentImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const mapCategory = (uiCategory: string) => {
    const categoryMap: { [key: string]: string } = {
      top: "tops",
      bottom: "bottoms",
      fullbody: "one-pieces",
    }
    return categoryMap[uiCategory] || "tops"
  }
const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
  const handleTryOn = async () => {
    if (!modelImage || !garmentImage) return;

    setShowBottomSection(false);
    setIsLoading(true);
    setResultImage(null);

    try {
        let modelBase64 = modelImage;
        // Check if the modelImage is a URL and needs to be converted
        if (modelImage.startsWith('/') || modelImage.startsWith('http')) {
            modelBase64 = await imageUrlToBase64(modelImage);
        }

        const garmentBase64 = garmentImage; // Assuming garment is already base64

        console.log("Category being sent:", mapCategory(category));
        console.log("Sending direct request to FASHN API");

        const payload = {
            model_image: modelBase64,
            garment_image: garmentBase64,
            category: mapCategory(category),
            mode: quality,
            num_samples: samples,
        };

        const response = await fetch("https://api.fashn.ai/v1/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("FASHN API error response:", errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("FASHN API response:", data);

        const predictionId = data.id;
        if (!predictionId) {
            throw new Error("No prediction ID returned from API");
        }

        console.log("Received prediction ID:", predictionId);
        await pollForResultsDirect(predictionId);
    } catch (error) {
        console.error("Error during try-on process:", error);
        setIsLoading(false);
        setShowBottomSection(true);
    }
};

  const pollForResultsDirect = async (predictionId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const checkStatus = async () => {
      try {
        console.log(`Polling attempt ${attempts + 1} for ID: ${predictionId}`)

        const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB",
          },
        })

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          console.error("FASHN Status API error:", errorText)
          throw new Error(`Status API error: ${statusResponse.status} - ${errorText}`)
        }

        const statusData = await statusResponse.json()
        console.log("FASHN Status full response:", JSON.stringify(statusData, null, 2))

        switch (statusData.status) {
          case "completed":
            if (statusData.output && statusData.output.length > 0) {
              const resultImageUrl = statusData.output[0]
              console.log("COMPLETED - Setting result image URL:", resultImageUrl)

              const cacheBuster = `?t=${Date.now()}`
              setResultImage(resultImageUrl + cacheBuster)

              const testImg = new Image()
              testImg.onload = () => console.log("Image verified to load correctly:", resultImageUrl)
              testImg.onerror = (e) => console.error("Image failed to load:", e)
              testImg.src = resultImageUrl + cacheBuster

              setIsLoading(false)
              return
            } else {
              throw new Error("Processing completed but no output was provided")
            }
          case "failed":
            console.error("Processing failed:", statusData.error)
            throw new Error(statusData.error?.message || "Processing failed")
          case "processing":
          case "in_queue":
          case "starting":
            console.log(`Status is ${statusData.status}, continuing to poll...`)
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 2000)
            } else {
              throw new Error("Timed out waiting for result")
            }
            break
          default:
            throw new Error(`Unknown status: ${statusData.status}`)
        }
      } catch (error) {
        console.error("Error checking try-on status:", error)
        setIsLoading(false)
        setShowBottomSection(true)
      }
    }

    checkStatus()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragActive(type)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(null)
  }

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragActive(null)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === "model") {
          setModelImage(e.target?.result as string)
        } else {
          setGarmentImage(e.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const resetToInitialState = () => {
    setShowBottomSection(true)
    setResultImage(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Virtual Try-On Studio</h1>
          <p className="text-slate-600">Upload a model and garment to see how they look together</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Top Row with Upload Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Model Upload */}
            <motion.div
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">Select Model</span>
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
                <motion.button
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="h-4 w-4 text-slate-500" />
                </motion.button>
              </div>

              <div
                className="flex min-h-80 flex-col items-center justify-center p-4"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, "model")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "model")}
              >
                {!modelImage ? (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                      dragActive === "model" ? "border-purple-400 bg-purple-50 scale-[0.98]" : "border-slate-300"
                    }`}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      <ImageIcon className="mb-3 h-8 w-8 text-slate-400" />
                    </motion.div>
                    <p className="mb-2 text-sm text-slate-600">Paste/drop image here</p>
                    <p className="mb-4 text-sm text-slate-500">OR</p>
                    <motion.button
                      onClick={() => document.getElementById("model-upload")?.click()}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <motion.button
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setModelImage(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              <div className="p-4">
                <motion.button
                  onClick={() => setShowModelsModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-700 hover:bg-slate-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="h-4 w-4" />
                  Meet Our Models
                </motion.button>
              </div>
            </motion.div>

            {/* Garment Upload */}
            <motion.div
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">Select Garment</span>
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
                <motion.button
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="h-4 w-4 text-slate-500" />
                </motion.button>
              </div>

              <div
                className="flex min-h-80 flex-col items-center justify-center p-4"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, "garment")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "garment")}
              >
                {!garmentImage ? (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                      dragActive === "garment" ? "border-purple-400 bg-purple-50 scale-[0.98]" : "border-slate-300"
                    }`}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: 0.5 }}
                    >
                      <ImageIcon className="mb-3 h-8 w-8 text-slate-400" />
                    </motion.div>
                    <p className="mb-2 text-sm text-slate-600">Paste/drop image here</p>
                    <p className="mb-4 text-sm text-slate-500">OR</p>
                    <motion.button
                      onClick={() => document.getElementById("garment-upload")?.click()}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <motion.button
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setGarmentImage(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 text-sm text-slate-900">
                    Category
                    <Info className="h-4 w-4 text-slate-400" />
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      className={`border rounded-lg py-3 px-2 text-xs font-medium transition-all ${
                        category === "top"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setCategory("top")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="h-8 w-8"
                          fill={category === "top" ? "#8b5cf6" : "#64748b"}
                        >
                          <g data-name="Layer 89">
                            <path d="M77.361,20.145c-3.424-2.542-17-5.653-17.58-5.784a.967.967,0,0,0-.609.074c-.016,0-.033-.007-.049,0a20.579,20.579,0,0,1-18.183.035c-.01-.006-.022,0-.032,0a.977.977,0,0,0-.691-.107c-.577.131-14.156,3.242-17.58,5.784-4.335,3.217-11.487,49.05-12.877,58.2a1,1,0,0,0,.819,1.136l9.75,1.668a1.016,1.016,0,0,0,.17.015,1,1,0,0,0,.964-.737l7.951-29.249V84.665a1,1,0,0,0,1,1H69.584a1,1,0,0,0,1-1V51.181L78.535,80.43a1,1,0,0,0,.964.737,1.016,1.016,0,0,0,.17-.015l9.75-1.668a1,1,0,0,0,.819-1.136C88.849,69.194,81.7,23.361,77.361,20.145Z" />
                          </g>
                        </svg>
                        Top
                      </div>
                    </motion.button>

                    <motion.button
                      className={`border rounded-lg py-3 px-2 text-xs font-medium transition-all ${
                        category === "bottom"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setCategory("bottom")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="h-8 w-8"
                          fill={category === "bottom" ? "#8b5cf6" : "#64748b"}
                        >
                          <path d="M73.4130859,10H26.5869141c-0.5107422,0-0.9389648,0.3847656-0.9941406,0.8920898l-7.8144531,72.0258789c-0.0532227,0.4902344,0.2587891,0.9462891,0.7353516,1.0737305l22.2802734,5.9741211c0.2675781,0.0727539,0.5566406,0.0283203,0.7924805-0.1201172c0.2358398-0.1489258,0.3989258-0.3896484,0.449707-0.6640625L50,46.1245117l7.9638672,43.0571289c0.0507812,0.2744141,0.2138672,0.5151367,0.449707,0.6640625C58.574707,89.9472656,58.7602539,90,58.9472656,90c0.0864258,0,0.1738281-0.0112305,0.2587891-0.0341797l22.2802734-5.9741211c0.4765625-0.1274414,0.7885742-0.5834961,0.7353516-1.0737305l-7.8144531-72.0258789C74.3520508,10.3847656,73.9238281,10,73.4130859,10z" />
                        </svg>
                        Bottom
                      </div>
                    </motion.button>

                    <motion.button
                      className={`border rounded-lg py-3 px-2 text-xs font-medium transition-all ${
                        category === "fullbody"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setCategory("fullbody")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="h-8 w-8"
                          fill={category === "fullbody" ? "#8b5cf6" : "#64748b"}
                        >
                          <g data-name="Layer 34">
                            <path d="M24.109,98H75.891L65.244,41.215V38.073L68.23,17.108a6.33,6.33,0,0,0-2.8-6.245l-.184-.126V2H58.892V7.411c-.2-.019-.407-.029-.62-.029a6.428,6.428,0,0,0-5.353,2.86,3.525,3.525,0,0,1-5.848-.009,6.428,6.428,0,0,0-5.963-2.8V2H34.756v8.737l-.155.107a6.342,6.342,0,0,0-2.831,6.264l2.986,20.965v3.142Z" />
                          </g>
                        </svg>
                        Full-body
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Run Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleTryOn}
              disabled={!modelImage || !garmentImage || isLoading}
              className={`flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold transition-all ${
                !modelImage || !garmentImage || isLoading
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
              }`}
              whileHover={!(!modelImage || !garmentImage || isLoading) ? { scale: 1.05 } : {}}
              whileTap={!(!modelImage || !garmentImage || isLoading) ? { scale: 0.95 } : {}}
            >
              <Play className="h-5 w-5" />
              Run (~7s)
            </motion.button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-16 w-16 mb-4">
                <div className="absolute inset-0 h-full w-full animate-spin rounded-full border-4 border-t-purple-600 border-l-purple-600 border-r-transparent border-b-transparent"></div>
                <div
                  className="absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-r-purple-400 border-b-purple-400 border-l-transparent border-t-transparent"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-lg text-slate-600">Generating your virtual try-on...</p>
              <p className="text-sm text-slate-500 mt-1">This usually takes 7-10 seconds</p>
            </motion.div>
          )}

          {/* Result Image */}
          {resultImage && (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-slate-900">Your Virtual Try-On Result</h2>
              <div className="relative max-w-md">
                <img
                  src={resultImage || "/placeholder.svg"}
                  alt="Virtual try-on result"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = resultImage
                    link.download = "virtual-try-on-result.png"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </motion.button>
                <motion.button
                  onClick={resetToInitialState}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Another
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Bottom Settings Row - Only show when not loading and no result */}
          {showBottomSection && (
            <motion.div
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quality Settings */}
              <motion.div
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">Quality Settings</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      className={`border rounded-lg py-3 px-3 text-xs font-medium transition-all ${
                        quality === "performance"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setQuality("performance")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">⚡</span>
                        Performance
                      </div>
                    </motion.button>

                    <motion.button
                      className={`border rounded-lg py-3 px-3 text-xs font-medium transition-all ${
                        quality === "balanced"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setQuality("balanced")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">⚖️</span>
                        Balanced
                      </div>
                    </motion.button>

                    <motion.button
                      className={`border rounded-lg py-3 px-3 text-xs font-medium transition-all ${
                        quality === "quality"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setQuality("quality")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">💎</span>
                        Quality
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">Number of Samples</p>
                      <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <motion.span
                      className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full"
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
                      onChange={(e) => setSamples(Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((samples - 1) / 3) * 100}%, #e2e8f0 ${((samples - 1) / 3) * 100}%, #e2e8f0 100%)`,
                      }}
                    />
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1 text-xs text-slate-500">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">Seed</p>
                      <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <motion.button
                      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Shuffle className="h-3 w-3" />
                      Random
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
        {/* Models Modal */}
        {showModelsModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowModelsModal(false)
              setSelectedModelForPoses(null)
            }}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <h2 className="text-2xl font-bold text-slate-900">Meet Our Models</h2>
                <motion.button
                  onClick={() => {
                    setShowModelsModal(false)
                    setSelectedModelForPoses(null)
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </motion.button>
              </div>

              <div className="p-6">
                {!selectedModelForPoses ? (
                  // Model Selection View
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {Object.entries(modelsData).map(([modelId, model]) => (
                      <motion.div
                        key={modelId}
                        className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedModelForPoses(modelId)}
                      >
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={model.defaultImage || "/placeholder.svg"}
                            alt={model.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-slate-900">{model.name}</h3>
                          <p className="text-sm text-slate-600 capitalize">{model.gender} Model</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                            <span>4 poses available</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Pose Selection View
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <motion.button
                        onClick={() => setSelectedModelForPoses(null)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back to Models
                      </motion.button>
                      <div className="h-4 w-px bg-slate-300"></div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {modelsData[selectedModelForPoses as keyof typeof modelsData].name} - Choose a Pose
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {Object.entries(modelsData[selectedModelForPoses as keyof typeof modelsData].poses).map(
                        ([poseType, imageUrl]) => (
                          <motion.div
                            key={poseType}
                            className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setModelImage(imageUrl)
                              setShowModelsModal(false)
                              setSelectedModelForPoses(null)
                            }}
                          >
                            <div className="aspect-[3/4] overflow-hidden">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`${modelsData[selectedModelForPoses as keyof typeof modelsData].name} - ${poseType}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="p-3">
                              <h4 className="text-sm font-medium text-slate-900 capitalize">
                                {poseType.replace("-", " ")}
                              </h4>
                              <p className="text-xs text-slate-600">Click to select</p>
                            </div>
                          </motion.div>
                        ),
                      )}
                    </div>

                    <div className="mt-6 rounded-lg bg-purple-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                          <Info className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-900">Pose Guide</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            <strong>Full Body:</strong> Complete front view • <strong>3/4 Body:</strong> Angled front
                            view •<strong>Full Side:</strong> Complete side profile • <strong>Back:</strong> Rear view
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
