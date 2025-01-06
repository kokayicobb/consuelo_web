"use client";
import Image from "next/image";
import { useState, Suspense, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from "@react-three/drei";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SizeGuideButton } from "../Button/SizeGuideButton";
import { Header } from "./header";

import dynamic from "next/dynamic";
import TryOnButton from "../Virtual Try On";
import { TryOnResult } from "./TryOnResults";

const Model = dynamic(() => import("./Model3D"), { ssr: false });

export default function EquestrianHelmetPage() {
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("56");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModel, setShowModel] = useState(false);
  
  const modelPosition: [number, number, number] = [0, -1, 0];
  const modelRotation: [number, number, number] = [0, 5.2, 0];
  const images = [
    "/MainHelmet.png?height=600&width=600",
    "/SideHelmet.PNG?height=600&width=600&text=Back+View",
    "/FrontHelmet.png?height=600&width=600&text=Side+View",
    "/UnderHelmet.png?height=600&width=600&text=Interior+View",
  ];

  const sizes = ["54", "55", "56", "57", "58", "59", "60", "61"];
// Modify your page component (EquestrianHelmetPage)
const [tryOnState, setTryOnState] = useState({
  isProcessing: false,
  attemptCount: 0,
  maxAttempts: 60,
  resultUrl: null as string | null,
  error: null as string | null
});

// Update your handleTryOnResult function
const handleTryOnResult = useCallback((resultUrl: string) => {
  console.log("Received try-on result URL:", resultUrl);
  setTryOnState(prev => ({
    ...prev,
    isProcessing: false,
    resultUrl,
    error: null
  }));
}, []);

// Add a function to handle processing updates
const handleProcessingUpdate = useCallback((attemptCount: number) => {
  setTryOnState(prev => ({
    ...prev,
    isProcessing: true,
    attemptCount
  }));
}, []);

// Add clear function
const handleClearTryOn = useCallback(() => {
  setTryOnState({
    isProcessing: false,
    attemptCount: 0,
    maxAttempts: 60,
    resultUrl: null,
    error: null
  });
}, []);
  

  

  const relatedProducts = [
    { name: "Classic Riding Helmet", price: "$189.99", image: "/1.jpeg" },
    { name: "Dressage Pro Helmet", price: "$209.99", image: "/2.jpg" },
    { name: "Jumping Competition Helmet", price: "$229.99", image: "/3.jpeg" },
    { name: "Ventilated Summer Helmet", price: "$199.99", image: "/4.jpg" },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Images and 3D Model */}
          <div className="space-y-4">
            <div className="relative aspect-square">
              {showModel ? (
                <>
                  <Suspense
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Loading 3D View...
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
                      <color attach="background" args={["#f8f8f6"]} />
                      <ambientLight intensity={0.35} color={"#faf9f7"} />
                      <directionalLight
                        position={[5, 5, 5]}
                        intensity={0.9}
                        color={"#fff9f5"}
                        castShadow
                        shadow-mapSize={2048}
                        shadow-bias={-0.001}
                      />
                      <pointLight
                        position={[-5, 3, 5]}
                        intensity={0.15}
                        color={"#fff5eb"}
                      />
                      <Environment preset="city" background={false} />
                      <Model
                        position={modelPosition}
                        rotation={modelRotation}
                      />
                      <ContactShadows
                        position={[0, -1.5, 0]}
                        opacity={0.5}
                        scale={10}
                        blur={3.5}
                        far={5}
                      />
                      <OrbitControls
                        makeDefault
                        enableDamping
                        dampingFactor={0.1}
                        rotateSpeed={0.8}
                        minDistance={2}
                        maxDistance={10}
                        minPolarAngle={Math.PI / 10}
                        maxPolarAngle={Math.PI / 0.5}
                        enableZoom={true}
                        zoomSpeed={0.5}
                      />
                    </Canvas>
                    <Button
                      variant="outline"
                      className="absolute right-4 top-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={() => setShowModel(false)}
                    >
                      Exit 3D View
                    </Button>
                  </Suspense>
                </>
              ) : (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={`Equestrian Helmet View ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="rounded-lg object-cover"
                    priority
                  />
                  <Button
                    variant="outline"
                    className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => setShowModel(true)}
                  >
                    View in 3D
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((src, index) => (
                <div
                  key={index}
                  className={`cursor-pointer ${
                    index === currentImageIndex && !showModel
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setShowModel(false);
                  }}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Premium Equestrian Helmet</h1>
            <p className="text-gray-600">
              Experience unparalleled safety and comfort with our
              state-of-the-art equestrian helmet. Designed for both professional
              and amateur riders.
            </p>
            <div className="text-2xl font-bold">$249.99</div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Select Size (CM)</h3>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-2"
              >
                {sizes.map((size) => (
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

            <div className="flex flex-col gap-2">
              <SizeGuideButton />
              <TryOnButton
                garmentImage="/showcoat.jpg"
                category="tops"
                onResult={handleTryOnResult}
              />
            </div>

            {/* Display Try-On Results */}
            {tryOnResult && (
              <div className="mt-8 space-y-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
                  <Image
                    src={tryOnResult}
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
      <p className="text-sm text-gray-600">
        Virtual try-on result. Click 'Clear Try-On' to remove.
      </p>
    </div>
  )}

 
            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>

            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="sizing">Sizing Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p>
                  Our Premium Equestrian Helmet is crafted with advanced
                  materials to provide maximum protection without compromising
                  on comfort. The sleek design ensures a perfect fit for riders
                  of all levels, from beginners to seasoned professionals.
                </p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="list-disc space-y-2 pl-5">
                  <li>Advanced impact-absorbing technology</li>
                  <li>Ventilation system for optimal airflow</li>
                  <li>Adjustable fit system</li>
                  <li>Moisture-wicking liner</li>
                  <li>Meets or exceeds all safety standards</li>
                </ul>
              </TabsContent>
              <TabsContent value="sizing" className="mt-4">
                <p>
                  To find your perfect fit, measure the circumference of your
                  head about 1 inch above your eyebrows. Use this measurement to
                  select the appropriate size from our range. If you're
                  between sizes, we recommend choosing the larger size for a
                  more comfortable fit.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Virtual Try-On Results */}
        <TryOnResult 
          resultUrl={tryOnResult} 
          onClear={handleClearTryOn}
        />

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((product, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="relative mb-2 aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="rounded object-cover"
                  />
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

useGLTF.preload("/kask3.glb");