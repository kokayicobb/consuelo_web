"use client";
import Image from "next/image";
import { useState, Suspense, useCallback } from "react";
import {ShoppingCart, } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TryOnButton from "..";
import { SizeGuideButton } from "../../Button/SizeGuideButton";
import Model from "../../Store/Model3D";
import { TryOnResult } from "../../Store/TryOnResults";
import { Header } from "./header";

// Product image arrays remain the same
const womensDressImages = [
  "/Main_dress.jpg",
  "/red2.jpg",
  "/Second_dress.jpg",
  "/dress 3.jpg",
  "/red 4.jpg",
];

const mensShirtImages = [
  "/tom-1.png",
  "/tom-2.jpg",
 "/tom-3.jpg",
 "/tom-4.jpg",
 "/tom-5.jpg",
];

export default function SplitLandingPage() {
  // State management remains the same
  const [selectedGender, setSelectedGender] = useState<"women" | "men">("women");
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModel, setShowModel] = useState(false);

  // Size management remains the same
  const womensSizes = ["XS", "S", "M", "L", "XL"];
  const mensSizes = ["S", "M", "L", "XL", "XXL"];
  const [selectedSize, setSelectedSize] = useState(
    selectedGender === "women" ? "M" : "L"
  );

  // Try-on state management remains the same
  const [tryOnState, setTryOnState] = useState({
    isProcessing: false,
    attemptCount: 0,
    maxAttempts: 60,
    resultUrl: null as string | null,
    error: null as string | null,
  });

  // Callbacks remain the same
  const handleTryOnResult = useCallback((resultUrl: string) => {
    setTryOnState((prev) => ({
      ...prev,
      isProcessing: false,
      resultUrl,
      error: null,
    }));
  }, []);

  const handleClearTryOn = useCallback(() => {
    setTryOnState({
      isProcessing: false,
      attemptCount: 0,
      maxAttempts: 60,
      resultUrl: null,
      error: null,
    });
  }, []);

  // Product details function remains the same
  const getCurrentProduct = () => {
    if (selectedGender === "women") {
      return {
        images: womensDressImages,
        title: "Evening Cocktail Dress",
        price: "$299.99",
        description:
          "Elegant evening dress perfect for special occasions. Features a flattering silhouette and premium fabric.",
        sizes: womensSizes,
      };
    }
    return {
      images: mensShirtImages,
      title: "Suede Military Jacket",
      price: "$389.99",
      description:
        "Timeless oxford shirt crafted from premium cotton. Perfect for both casual and formal occasions.",
      sizes: mensSizes,
    };
  };
  const tryOnButtonRef = useRef<HTMLDivElement>(null);

  // Add this useEffect for the scroll and animation
  useEffect(() => {
    if (tryOnButtonRef.current) {
      // Scroll to the button with a slight delay for smooth transition
      setTimeout(() => {
        tryOnButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 500);
    }
  }, []);
  const currentProduct = getCurrentProduct();

  return (
    <>
      <Header />
      {/* Gender selection buttons */}
      <div className="flex w-full justify-center space-x-4 p-4">
        <Button
          onClick={() => setSelectedGender("women")}
          variant={selectedGender === "women" ? "default" : "outline"}
          className="w-40"
        >
          Women's Collection
        </Button>
        <Button
          onClick={() => setSelectedGender("men")}
          variant={selectedGender === "men" ? "default" : "outline"}
          className="w-40"
        >
          Men's Collection
        </Button>
      </div>

      {/* Main content area with adjusted grid layout */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-5 gap-8">
          {/* Product Images Section - Now takes up 3/5 of the space */}
          <div className="col-span-3 max-h-[800px] overflow-y-auto">
            <div className="mx-auto grid w-full grid-cols-2 gap-4 p-4">
              {currentProduct.images.map((src, index) => (
                <div key={index} className="relative aspect-[3/4] w-full">
                  <Image
                    src={src}
                    alt={`${selectedGender === "women" ? "Dress" : "Shirt"} View ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 60vw, 800px"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section - Now takes up 2/5 of the space */}
          <div className="col-span-2 space-y-6">
            {/* Rest of the product details content remains the same */}
            <h1 className="text-3xl font-bold">{currentProduct.title}</h1>
            <p className="text-gray-600">{currentProduct.description}</p>
            <div className="text-2xl font-bold">{currentProduct.price}</div>

            {/* Size Selection */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">Select Size</h3>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-2"
              >
                {currentProduct.sizes.map((size) => (
                  <div key={size}>
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

           {/* Try-On Button */}
<div 
  ref={tryOnButtonRef}
  className="flex flex-col gap-2 animate-glow"
>
  <TryOnButton
    garmentImage={
      selectedGender === "women" ? "/Second_dress.jpg" : "/toms.jpg"
    }
    category={selectedGender === "women" ? "one-pieces" : "tops"}
    onResult={handleTryOnResult}
  />
</div>


            {/* Try-On Results */}
            {tryOnState.resultUrl && (
              <div className="mt-8 space-y-4">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border bg-gray-50">
                  <Image
                    src={tryOnState.resultUrl}
                    alt="Virtual Try-On Result"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <Button
                    variant="outline"
                    className="absolute right-4 top-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={handleClearTryOn}
                  >
                    Clear Try-On
                  </Button>
                </div>
              </div>
            )}

            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>

            {/* Product Information Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="sizing">Sizing Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p>
                  {selectedGender === "women"
                    ? "This stunning evening dress combines elegance with modern style. Perfect for formal events and special occasions."
                    : "A versatile oxford shirt that brings sophistication to any wardrobe. Made with premium cotton for ultimate comfort."}
                </p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="list-disc space-y-2 pl-5">
                  {selectedGender === "women" ? (
                    <>
                      <li>Premium silk blend fabric</li>
                      <li>Elegant A-line silhouette</li>
                      <li>Hidden side zipper</li>
                      <li>Fully lined</li>
                      <li>Available in multiple colors</li>
                    </>
                  ) : (
                    <>
                      <li>100% premium cotton</li>
                      <li>Classic button-down collar</li>
                      <li>Traditional barrel cuffs</li>
                      <li>Chest pocket</li>
                      <li>Modern slim fit</li>
                    </>
                  )}
                </ul>
              </TabsContent>
              <TabsContent value="sizing" className="mt-4">
                <p>
                  {selectedGender === "women"
                    ? "For the perfect fit, measure your bust, waist, and hips. Compare these measurements with our size chart to find your ideal size. If between sizes, we recommend sizing up for a more comfortable fit."
                    : "Measure your chest, waist, and sleeve length. Use our detailed size chart to find your perfect fit. For a more relaxed fit, consider sizing up."}
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}