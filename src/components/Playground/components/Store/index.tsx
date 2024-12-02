"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SizeGuideButton } from "../Button/SizeGuideButton";
import { Header } from "./header";

export default function EquestrianHelmetPage() {
  const [selectedSize, setSelectedSize] = useState("56");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/MainHelmet.png?height=600&width=600",
    "/SideHelmet.PNG?height=600&width=600&text=Back+View",
    "/FrontHelmet.png?height=600&width=600&text=Side+View",
    "/UnderHelmet.png?height=600&width=600&text=Interior+View",
  ];

  const sizes = ["54", "55", "56", "57", "58", "59", "60", "61"];

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
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square">
              <Image
                src={images[currentImageIndex]}
                alt={`Equestrian Helmet View ${currentImageIndex + 1}`}
                fill
                className="object-cover rounded-lg"
              />
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
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className={`object-cover rounded cursor-pointer ${
                    index === currentImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
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

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Size (CM)</h3>
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

            <SizeGuideButton />
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
                  Our Premium Equestrian Helmet is crafted with advanced
                  materials to provide maximum protection without compromising
                  on comfort. The sleek design ensures a perfect fit for riders
                  of all levels, from beginners to seasoned professionals.
                </p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="list-disc pl-5 space-y-2">
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
                  select the appropriate size from our range. If you&apos;re
                  between sizes, we recommend choosing the larger size for a
                  more comfortable fit.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((product, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="aspect-square relative mb-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
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
