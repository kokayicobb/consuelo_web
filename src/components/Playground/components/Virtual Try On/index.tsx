// src/components/Playground/components/Virtual Try On/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, Info, Shirt, Timer, X } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { useMediaQuery } from '../../hooks/UseMediaQuery';
import { DrawerTrigger, DrawerContent } from '../ui/drawer';
import { Checkbox } from '@radix-ui/react-checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import MobileDrawer from './mobile-drawer';


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
  const [screen, setScreen] = useState("welcome");
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1000px)");

  // Constants for polling
  const MAX_POLL_ATTEMPTS = 60;
  const POLL_INTERVAL = 2000;
  const POLL_TIMEOUT = 120000;

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset states when dialog/drawer closes
      setScreen("welcome");
      setUserImage(null);
      setUserImagePreview(null);
      setResult(null);
      setError(null);
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    const loadGarmentImage = async () => {
      try {
        if (!garmentImage) {
          console.error("No garment image provided");
          return;
        }

        if (
          garmentImage.startsWith("data:") ||
          garmentImage.startsWith("http")
        ) {
          setGarmentBase64(garmentImage);
          return;
        }

        const response = await fetch(garmentImage);
        if (!response.ok) {
          throw new Error(
            `Failed to load garment image: ${response.statusText}`,
          );
        }

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          setGarmentBase64(reader.result);
        };

        reader.onerror = (error) => {
          console.error("Error reading garment image:", error);
          setError("Error loading garment image");
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading garment image:", err);
        setError("Error loading garment image. Please try again.");
      }
    };

    loadGarmentImage();
  }, [garmentImage]);

  const pollStatus = async (id) => {
    pollingRef.current = true;
    attemptCountRef.current = 0;

    const poll = async () => {
      attemptCountRef.current++;
      console.log(`Polling attempt ${attemptCountRef.current} for ID: ${id}`);

      try {
        const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
          headers: {
            Authorization: "Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Status response:", data);

        switch (data.status) {
          case "completed":
            if (data.output && data.output.length > 0) {
              console.log(
                "Processing completed successfully. Result:",
                data.output[0],
              );
              setResult(data.output[0]);
              if (onResult) onResult(data.output[0]);
              setIsLoading(false);
              pollingRef.current = false;
            } else {
              throw new Error(
                "Processing completed, but no output was provided.",
              );
            }
            break;

          case "failed":
            throw new Error(
              data.error?.message || "Processing failed on the server.",
            );

          case "processing":
          case "in_queue":
          case "starting":
            console.log(`Status: ${data.status}. Retrying in 2 seconds...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await poll();
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
      setError("Please ensure both your photo and garment image are loaded");
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

      console.log("Initiating try-on request");
      const response = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB",
        },
        body: JSON.stringify({
          model_image: base64Image,
          garment_image: garmentBase64,
          category: category,
          mode: "balanced",
          num_samples: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Try-on API response:", data);

      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }

      if (!data.id) {
        throw new Error("No prediction ID received");
      }

      await pollStatus(data.id);
    } catch (err) {
      console.error("Try-on error:", err);
      setError(`Error: ${err.message}`);
      setIsLoading(false);
      pollingRef.current = false;
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImagePreview(reader.result);
      setUserImage(file);
      setError(null);
    };
    reader.onerror = () => {
      setError("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUserImage(null);
    setUserImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fashionFacts = [
    "Did you know? The first fashion magazine was published in Germany in 1586!",
    "High heels were originally worn by Persian horsemen in the 10th century to keep their feet in stirrups.",
    "The concept of 'ready-to-wear' clothing didn't exist until the Industrial Revolution in the 19th century.",
    "Buttons were originally used as decorative ornaments rather than fasteners - buttonholes weren't invented until the 13th century.",
    "The little black dress became iconic after Coco Chanel published a simple calf-length black dress in Vogue in 1926.",
    "The word 'denim' comes from the French phrase 'serge de Nîmes', referring to the city where the fabric was first made.",
    "Before the 1920s, pink was considered a masculine color while blue was viewed as more feminine.",
  ];
  const [instructionsChecked, setInstructionsChecked] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    // Reset animation state when component mounts
    setHasAnimated(false);
    return () => {
      // Clean up (will run when component unmounts)
      setHasAnimated(false);
    };
  }, []);

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-gray-300 p-4">
      <Shirt className="h-12 w-12 text-primary" />
      <p className="text-center text-sm text-muted-foreground">
        Experience clothes virtually before you buy. Our AI-powered fitting room
        helps you see how items will look on you.
      </p>

      <AnimatePresence>
        <motion.div
          initial={!hasAnimated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => setHasAnimated(true)}
          className="w-full space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Best Photo Tips
            </h3>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm leading-relaxed text-gray-700">
              For the best virtual try-on results, please follow these
              guidelines when taking your photo:
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">Clear, full-body photo</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">Simple background</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">
                  Face forward with arms slightly away
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-4">
            <Checkbox
              id="instructions-check"
              checked={instructionsChecked}
              onCheckedChange={(checked) =>
                setInstructionsChecked(checked as boolean)
              }
              className="border-gray-300"
            />
            <label
              htmlFor="instructions-check"
              className="cursor-pointer select-none text-sm font-medium leading-none text-gray-700"
            >
              I understand these guidelines and will follow them for the best
              results
            </label>
          </div>

          <Button
            className="w-full"
            onClick={() => setScreen("upload")}
            disabled={!instructionsChecked}
          >
            Start Virtual Try-On
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const UploadScreen = () => (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            handleImageUpload(e);
            if (e.target.files[0]) setScreen("preview");
          }}
          className="hidden"
          ref={fileInputRef}
          disabled={isLoading}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2"
          variant="outline"
          disabled={isLoading}
        >
          <Camera className="h-8 w-8" />
          <span>Upload Your Photo</span>
          <span className="text-sm text-gray-500">Click to browse</span>
        </Button>
      </div>
    </div>
  );
//
//
  const PreviewScreen = () => (
    <div className="space-y-4 rounded-lg border border-gray-300 p-4">
      <div className="flex justify-start">
        <div className="relative">
          {" "}
          {/* Added container specifically for image and button */}
          <img
            src={userImagePreview}
            alt="Preview"
            className="max-h-96 w-auto max-w-full rounded-lg"
          />
          <Button
            onClick={() => {
              removeImage();
              setScreen("upload");
            }}
            className="absolute right-2 top-2 rounded-full p-2"
            size="icon"
            variant="destructive"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={() => {
          handleTryOn();
          setScreen("result");
        }}
        disabled={isLoading || !userImage || !garmentBase64}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Try On Now"}
      </Button>
    </div>
  );

  const ResultScreen = () => (
    <div className="space-y-4 rounded-lg border border-gray-300 p-4">
      {isLoading && (
        <div className="mt-4 space-y-4 text-left">
          {" "}
          {/* Changed text-center to text-left */}
          <Timer></Timer>,
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Try-on AI is processing your image... This typically takes 10-13
              seconds depending on your connection speed.
            </p>
            <p className="mt-4 text-sm italic text-gray-500">
              While you wait, here's an interesting fashion fact:
            </p>
            <p className="text-sm text-gray-700">
              {" "}
              {/* Removed max-w-md and mx-auto */}
              {fashionFacts[Math.floor(Math.random() * fashionFacts.length)]}
            </p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div className="relative flex justify-start">
            {" "}
            {/* Added container with left alignment */}
            <img
              src={result}
              alt="Try-on result preview"
              className="max-h-96 w-auto max-w-full rounded-lg"
              onLoad={() => {
                console.log("Result image loaded successfully");
                setIsLoading(false);
              }}
              onError={(e) => {
                console.error("Error loading result image");
                setError("Error loading result image");
                setIsLoading(false);
              }}
            />
          </div>
          <Button onClick={() => setScreen("upload")} className="mt-4 w-full">
            Try Another Photo
          </Button>
        </div>
      )}
    </div>
  );

  const Content = () => (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {screen === "welcome" && <WelcomeScreen />}
      {screen === "upload" && <UploadScreen />}
      {screen === "preview" && <PreviewScreen />}
      {screen === "result" && <ResultScreen />}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="link" className="w=auto h-auto justify-start p-0">
            <span className="whitespace-normal text-sm">
              Try-On Studio <span className="underline">Powered by AI</span>{" "}
              {/* <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text px-[2px] text-sm italic text-transparent hover:no-underline">
              Powered by AI
            </span> */}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <MobileDrawer open={open} onOpenChange={handleOpenChange}>
      <Content />
    </MobileDrawer>
  );
};

export default TryOnButton;
