"use client";

import React, { useState } from 'react';

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, ChevronRight, ChevronLeft, Camera, X } from 'lucide-react';
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FaceDetection from "../Head Measurments/FaceDetection";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Button } from '../ui/button';

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

const HEAD_CIRCUMFERENCES = Array.from({ length: 13 }, (_, i) => `${51 + i} cm`);
const HEAD_SHAPES = ["Round Oval", "Intermediate Oval", "Long Oval"];
const HAIRSTYLES = [
  "Short Hair",
  "Low Ponytail",
  "Low Braided Ponytail",
  "French Braid",
  "Double Braids (Pigtail)",
  "Low Bun",
  "Braided Bun",
  "Tucked Ponytail",
  "Half-Up Braid",
];
const FIT_PREFERENCES = ["Tight Fit", "Perfect Fit", "Loose Fit"];

export function SizeGuideForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sizeRecommendation, setSizeRecommendation] = React.useState<string | null>(null);
  const [showExactSize, setShowExactSize] = React.useState(false);
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.headCircumference;
      case 2:
        return !!formData.headShape;
      case 3:
        return !!formData.typicalHairstyle;
      case 4:
        return !!formData.fitPreference;
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
      <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Calculating your size...</p>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] space-y-6 p-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Recommended Size</h2>
        <div className="text-3xl font-bold">{sizeRecommendation}</div>
        <SizeVisualization
          size={sizeRecommendation}
          fitPreference={formData.fitPreference}
          showExactSize={showExactSize}
        />
        <p className="text-sm text-center text-muted-foreground">
          Based on your measurements and preferences, we recommend this size for the best fit.
        </p>
        <Button variant="outline" size="sm" onClick={() => setShowExactSize(!showExactSize)}>
          {showExactSize ? "Show Letter Size" : "Show Exact Size"}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="flex flex-col min-h-screen">
        <div className="p-4">
          <Button variant="ghost" className="ml-auto" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col space-y-6 p-4 max-w-md mx-auto">
            <StepIndicator currentStep={step} totalSteps={4} />
            <div className="space-y-4">
              {step === 1 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Head Circumference
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => setShowFaceDetection(true)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Camera className="h-6 w-6 text-primary" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Try our AI camera measurement tool</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    value={formData.headCircumference} 
                    onValueChange={(value) => updateFormData("headCircumference", value)}
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
                <FormStep
                  label="Fit Preference"
                  value={formData.fitPreference}
                  onChange={(value) => updateFormData("fitPreference", value)}
                  options={FIT_PREFERENCES}
                  tooltip="Select how you prefer the product to fit on your head."
                />
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
        </div>
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
                    className="cursor-pointer hover:opacity-80 transition-opacity"
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
    <div className="flex justify-center items-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            index < currentStep ? "bg-primary" : "bg-primary/20"
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
              "flex flex-col items-center p-2 rounded-lg transition-colors",
              value === shape ? "bg-primary/20" : "hover:bg-primary/10"
            )}
          >
            <Image
              src={`/placeholder.svg?height=100&width=100&text=${shape}`}
              alt={shape}
              width={100}
              height={100}
              className="rounded-full bg-muted"
            />
            <span className="text-xs mt-1">{shape}</span>
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
      <ScrollArea className="w-full max-w-[320px] mx-auto">
        <div className="flex gap-4 pb-4">
          {options.map((style) => (
            <div key={style} className="flex-shrink-0">
              <button
                onClick={() => onChange(style)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors min-w-[100px]",
                  value === style ? "bg-primary/20" : "hover:bg-primary/10"
                )}
              >
                <Image
                  src={`/placeholder.svg?height=80&width=80&text=${style}`}
                  alt={style}
                  width={80}
                  height={80}
                  className="rounded-full bg-muted"
                />
                <span className="text-xs mt-1 w-full text-center break-words">
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
  size,
  fitPreference,
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

  function getExactSize(size: string | null): string {
    switch (size) {
      case "XXS":
        return "49-50 cm";
      case "XS":
        return "51-52 cm";
      case "S":
        return "53-54 cm";
      case "M":
        return "55-56 cm";
      case "L":
        return "57-58 cm";
      case "XL":
        return "59-60 cm";
      case "XXL":
        return "61-62 cm";
      default:
        return "Unknown";
    }
  }
  return (
    <div className="relative w-40 h-40">
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
          {showExactSize ? getExactSize(size) : size}
        </span>
      </div>
    </div>
  );
}

function calculateRecommendedSize(formData: FormData): string {
  const circumference = parseInt(formData.headCircumference);
  let size: string;

  // Precise size mapping based on actual circumference
  if (circumference <= 50) {
    size = "XXS";
  } else if (circumference <= 52) {
    size = "XS";
  } else if (circumference <= 54) {
    size = "S";
  } else if (circumference <= 56) {
    size = "M";
  } else if (circumference <= 58) {
    size = "L";
  } else if (circumference <= 60) {
    size = "XL";
  } else {
    size = "XXL";
  }

  // Apply fit preference adjustments
  if (formData.fitPreference === "Tight Fit") {
    // If user wants tight fit, recommend one size down
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
    // If user wants loose fit, recommend one size up
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