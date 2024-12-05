"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

import { Shield, LightbulbIcon, Camera, CheckCircle, Info  } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FaceDetection from "../Head Measurments/FaceDetection";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion } from "framer-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "../ui/checkbox";

interface FormData {
  headCircumference: string;
  headShape: string;
  typicalHairstyle: string;
  fitPreference: string;
}

const INITIAL_FORM_DATA: FormData = {
  headCircumference: "",
  headShape: "",
  typicalHairstyle: "",
  fitPreference: "",
};

const HEAD_CIRCUMFERENCES = Array.from(
  { length: 14 },
  (_, i) => `${50 + i} cm`,
);
const HEAD_SHAPES = ["Round Oval", "Intermediate Oval", "Long Oval"];
const HAIRSTYLES = [
  "Short Hair",
  "Low Ponytail",
  "Hair Net/Hair Up"

  // "Low Braided Ponytail",
  // "French Braid",
  // "Double Braids (Pigtail)",
  // "Low Bun",
  // "Braided Bun",
  // "Tucked Ponytail",
  // "Half-Up Braid",
];
const FIT_PREFERENCES = ["Tight Fit", "Perfect Fit", "Loose Fit"];

export function SizeGuideForm() {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sizeRecommendation, setSizeRecommendation] = React.useState<
    string | null
  >(null);
  const [showExactSize, setShowExactSize] = React.useState(true);
  const [showFaceDetection, setShowFaceDetection] = useState(false);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const recommendedSize = calculateRecommendedSize(formData);
    setSizeRecommendation(recommendedSize);
    setStep(5);
    setIsLoading(false);
  };
  const [safetyChecked, setSafetyChecked] = useState(false)
  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.headCircumference;
      case 2:
        return !!formData.headShape;
      case 3:
        return !!formData.typicalHairstyle;
      case 4:
        return safetyChecked;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 4) {
      handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  if (showFaceDetection) {
    return (
      <div className="w-full">
        <FaceDetection />
        <Button
          className="mt-4 w-full"
          onClick={() => setShowFaceDetection(false)}
          variant="outline"
        >
          Back to Form
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">
          Calculating your size...
        </p>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center space-y-6 p-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Your Recommended Size
        </h2>
        <div className="text-3xl font-bold">{sizeRecommendation}</div>
        <SizeVisualization
          size={sizeRecommendation}
          fitPreference={formData.fitPreference}
          showExactSize={showExactSize}
        />
        <p className="text-center text-sm text-muted-foreground">
          Based on your measurements and preferences, we recommend this size for
          the best fit.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExactSize(!showExactSize)}
        >
          {showExactSize ? "Show Shell Size" : "Show Exact Size"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col space-y-6 p-4 sm:p-6 md:p-8">
      <StepIndicator currentStep={step} totalSteps={4} />
      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Head Circumference
              </label>
              <button
                onClick={() => setShowFaceDetection(true)}
                className="flex cursor-pointer items-center transition-opacity hover:opacity-80"
              >
                <Camera className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xs italic text-muted-foreground">
                  AI Tool
                </span>
              </button>
            </div>
            <Select
              value={formData.headCircumference}
              onValueChange={(value) =>
                updateFormData("headCircumference", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Head Circumference" />
              </SelectTrigger>
              <SelectContent>
                {HEAD_CIRCUMFERENCES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 2 && (
          <FormStep
            label="Head Shape"
            value={formData.headShape}
            onChange={(value) => updateFormData("headShape", value)}
            options={HEAD_SHAPES}
            tooltip="Select your head shape type"
          />
        )}

        {step === 3 && (
          <FormStep
            label="Typical Hairstyle"
            value={formData.typicalHairstyle}
            onChange={(value) => updateFormData("typicalHairstyle", value)}
            options={HAIRSTYLES}
            tooltip="Select your usual hairstyle"
          />
        )}

{step === 4 && (
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Safety Information</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                We prioritize your safety. Our advanced algorithm uses the information you've provided to recommend a helmet that offers both optimal protection and comfort.
              </p>
              
              <div className="mt-3 flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  We always recommend selecting a helmet that fits perfectly - neither too loose nor too tight. This ensures maximum safety during your rides.
                </p>
              </div>
            </div>
          
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200">
              <Checkbox
                id="safety-check"
                checked={safetyChecked}
                onCheckedChange={(checked) => setSafetyChecked(checked as boolean)}
                className="border-gray-300"
              />
              <label
                htmlFor="safety-check"
                className="text-sm font-medium leading-none cursor-pointer select-none text-gray-700"
              >
                I understand the importance of proper helmet fitting and agree to follow the safety guidelines.
              </label>
            </div>

          </motion.div>
        )}
      </div>

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep((prev) => prev - 1)}>
            Back
          </Button>
        )}
        <Button
          className={cn("ml-auto", step === 1 && "w-full")}
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === 4 ? "Calculate Size" : "Next"}
        </Button>
      </div>
    </div>
  );
}

interface FormStepProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  tooltip: string;
}

function FormStep({ label, value, onChange, options, tooltip }: FormStepProps) {
  const [showFaceDetection, setShowFaceDetection] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {label === "Head Circumference" && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowFaceDetection(true)}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <Camera className="h-6 w-6 text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showFaceDetection && <FaceDetection />}
          </>
        )}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            index < currentStep ? "bg-primary" : "bg-primary/20",
          )}
        />
      ))}
    </div>
  );
}

interface HeadShapeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

function HeadShapeSelector({
  value,
  onChange,
  options,
}: HeadShapeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select Your Head Shape</h3>
      <div className="flex justify-around">
        {options.map((shape) => (
          <button
            key={shape}
            onClick={() => onChange(shape)}
            className={cn(
              "flex flex-col items-center rounded-lg p-2 transition-colors",
              value === shape ? "bg-primary/20" : "hover:bg-primary/10",
            )}
          >
            <Image
              src={`/placeholder.svg?height=100&width=100&text=${shape}`}
              alt={shape}
              width={100}
              height={100}
              className="rounded-full bg-muted"
            />
            <span className="mt-1 text-xs">{shape}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface HairstyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

function HairstyleSelector({
  value,
  onChange,
  options,
}: HairstyleSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select Your Typical Hairstyle</h3>
      <ScrollArea className="mx-auto w-full max-w-[320px]">
        <div className="flex gap-4 pb-4">
          {options.map((style) => (
            <div key={style} className="flex-shrink-0">
              <button
                onClick={() => onChange(style)}
                className={cn(
                  "flex min-w-[100px] flex-col items-center rounded-lg p-2 transition-colors",
                  value === style ? "bg-primary/20" : "hover:bg-primary/10",
                )}
              >
                <Image
                  src={`/placeholder.svg?height=80&width=80&text=${style}`}
                  alt={style}
                  width={80}
                  height={80}
                  className="rounded-full bg-muted"
                />
                <span className="mt-1 w-full break-words text-center text-xs">
                  {style}
                </span>
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

interface SizeVisualizationProps {
  size: string | null;
  fitPreference: string;
  showExactSize: boolean;
}

function SizeVisualization({
  fitPreference,
  size,
  showExactSize,
}: SizeVisualizationProps) {
  const getFitColor = () => {
    switch (fitPreference) {
      case "Tight Fit":
        return "bg-blue-500";
      case "Perfect Fit":
        return "bg-green-500";
      case "Loose Fit":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSizeFromMeasurement = (measurement: string | null): string => {
    switch (measurement) {
      case "50 cm":
      case "51 cm":
      case "52 cm":
      case "53 cm":
      case "54 cm":
        return "Shell 0";
      case "55 cm":
      case "56 cm":
        return "Shell 1";
      case "57 cm":
      case "58 cm":
      case "59 cm":
        return "Shell 2";
      case "60 cm":
      case "61 cm":
      case "62 cm":
      case "63 cm":
        return "Shell 3";
      default:
        return "Unknown";
    }
  };
  
  return (
    <div className="relative h-40 w-40">
      <div className="absolute inset-0 rounded-full border-4 border-gray-300" />
      <div
        className={`absolute inset-2 rounded-full ${getFitColor()} opacity-50`}
        style={{
          transform: `scale(${
            fitPreference === "Loose Fit"
              ? 0.95
              : fitPreference === "Tight Fit"
                ? 0.85
                : 0.9
          })`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">
          {showExactSize ? size : getSizeFromMeasurement(size)}
        </span>
      </div>
    </div>
  );
}
function calculateRecommendedSize(formData: FormData): string {
  const circumference = parseInt(formData.headCircumference);
  let size: string;

  // Determine base size
  if (circumference === 50) {
    size = "50 cm";
} else if (circumference === 51) {
    size = "51 cm";
} else if (circumference === 52) {
    size = "52 cm";
} else if (circumference === 53) {
    size = "53 cm";
} else if (circumference === 54) {
    size = "54 cm";
} else if (circumference === 55) {
    size = "55 cm";
} else if (circumference === 56) {
    size = "56 cm";
} else if (circumference === 57) {
    size = "57 cm";
} else if (circumference === 58) {
    size = "58 cm";
} else if (circumference === 59) {
    size = "59 cm";
} else if (circumference === 60) {
    size = "60 cm";
} else if (circumference === 61) {
    size = "61 cm";
} else if (circumference === 62) {
    size = "62 cm";
} else if (circumference === 63) {
    size = "63 cm";
} else {
    size = "No size available";
}

  // Adjust for fit preference
  if (formData.fitPreference === "Tight Fit") {
    switch (size) {
      case "XXL":
        return "XL";
      case "XL":
        return "L";
      case "L":
        return "M";
      case "M":
        return "S";
      case "S":
        return "XS";
      case "XS":
        return "XXS";
      default:
        return size;
    }
  } else if (formData.fitPreference === "Loose Fit") {
    switch (size) {
      case "XXS":
        return "XS";
      case "XS":
        return "S";
      case "S":
        return "M";
      case "M":
        return "L";
      case "L":
        return "XL";
      case "XL":
        return "XXL";
      default:
        return size;
    }
  }

  return size;
}
