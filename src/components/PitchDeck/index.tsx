"use client"
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingCart, ArrowRight, Users, TrendingUp, Code, Brain, Trophy, Target, Play } from "lucide-react";

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "The Future of Online Shopping",
      content: (
        <div className="flex flex-col items-center justify-center w-full space-y-6 text-center">
          <div className="text-4xl font-bold text-blue-600">Consuelo</div>
          <div className="text-xl text-gray-600">Empowering Every Shopper with AI-Driven Fit Accuracy</div>
          <ShoppingCart className="w-16 h-16 text-blue-500" />
          <div className="text-base text-gray-500">
            Presented by Kokayi Cobb
            <br />
            Founder, CEO & CTO
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "The World Today",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4 bg-red-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl text-red-700">The Reality</h3>
            <div className="text-4xl font-bold text-red-600">48%</div>
            <p className="text-gray-700">of online clothes don't fit as expected</p>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-500" />
              <p className="text-sm text-gray-600">Millions struggle with fit uncertainty</p>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold">Plus-Size Market Pain</h4>
              <p className="text-2xl font-bold text-orange-600">$304B+</p>
              <p className="text-sm text-gray-600">market limited by fit uncertainty</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold">Current Solutions</h4>
              <p className="text-gray-600">Basic size charts</p>
              <p className="text-gray-600">Generic product images</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "The Team",
      content: (
        <div className="flex flex-col space-y-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Code className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kokayi Cobb</h3>
                <p className="text-gray-600">Founder, CEO & CTO</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">AI/ML Expert</span>
              </div>
              <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Software Developer</span>
              </div>
              <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">E-commerce Focus</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Technical Excellence</h4>
              <p className="text-gray-700">Deep expertise in AI, diffusion models, and scalable architecture</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Industry Understanding</h4>
              <p className="text-gray-700">First-hand experience with e-commerce challenges</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "A Personal Journey",
      content: (
        <div className="flex flex-col space-y-6 p-6 bg-blue-50 rounded-lg">
          <div className="space-y-4">
            <div className="text-xl font-semibold text-blue-800">"Someone should fix this..."</div>
            <p className="text-gray-700">
              It started with a trip to visit family. Half the clothes I ordered online didn't fit.
              Sitting on that plane, frustrated, I realized - I'm a developer. I could solve this.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold">The Problem</p>
              <p className="text-gray-600">Uncertainty in online shopping</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold">The Journey</p>
              <p className="text-gray-600">From B2C app to B2B solution</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold">The Mission</p>
              <p className="text-gray-600">Transform online shopping</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Transforming the Experience",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4 bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl">Try-On Studio</h3>
            <p className="text-gray-700">See exactly how clothes will look on you</p>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold">Powered by Diffusion AI</p>
              <p className="text-sm text-gray-600">One photo creates endless try-ons</p>
            </div>
            <div className="text-sm text-blue-600">From uncertainty to confidence</div>
          </div>
          <div className="flex flex-col space-y-4 bg-green-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl">Fit Calculator</h3>
            <p className="text-gray-700">Precise fit predictions</p>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold">Smart Measurements</p>
              <p className="text-sm text-gray-600">From helmets to full apparel</p>
            </div>
            <div className="text-sm text-green-600">From guessing to knowing</div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Market Opportunity",
      content: (
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">$304B+</div>
              <div className="text-sm">Plus-Size Market</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">$4.3B</div>
              <div className="text-sm">Safety Equipment</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">48%</div>
              <div className="text-sm">Return Rate Reduction</div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Expansion Path</h3>
            <div className="flex items-center space-x-4">
              <div className="text-blue-600">Helmets</div>
              <ArrowRight className="w-4 h-4" />
              <div className="text-blue-600">Safety Gear</div>
              <ArrowRight className="w-4 h-4" />
              <div className="text-blue-600">Full Apparel</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Why We Win",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Current Market</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">Basic Size Charts</p>
                <p className="text-sm text-gray-600">Generic measurements only</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">Standard Images</p>
                <p className="text-sm text-gray-600">Model-only photos</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">High Return Rates</p>
                <p className="text-sm text-gray-600">Costly for retailers</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Our Innovation</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">AI-Powered Visuals</p>
                <p className="text-sm text-gray-600">Personalized try-ons</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">Smart Measurements</p>
                <p className="text-sm text-gray-600">Precise fit prediction</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-semibold">Dual Product Solution</p>
                <p className="text-sm text-gray-600">Visual + Technical approach</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Our Advantage",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Economics</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm">Cost per scan</div>
                  <div className="text-2xl font-bold text-green-600">$0.04</div>
                </div>
                <ArrowRight className="w-6 h-6" />
                <div>
                  <div className="text-sm">Revenue per scan</div>
                  <div className="text-2xl font-bold text-green-600">$0.20</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Technology</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Scalable AI infrastructure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Advanced diffusion AI</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Revenue Model</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="font-bold">Starter</div>
                <div className="text-purple-600">$20/100 scans</div>
                <div className="text-sm text-gray-600">Perfect for testing</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-bold">Growth</div>
                <div className="text-purple-600">$49/month</div>
                <div className="text-sm text-gray-600">300 scans included</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-bold">Scale</div>
                <div className="text-purple-600">$299/month</div>
                <div className="text-sm text-gray-600">2,500 scans included</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Growth Path",
      content: (
        <div className="flex flex-col space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Trophy className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-bold">Current Wins</h3>
              <ul className="mt-2 space-y-2 text-gray-700">
                <li>• Shopify App Store </li>
                <li>• Klaviyo integration talks</li>
                <li>• First safety partner secured</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <Target className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-bold">Next Steps</h3>
              <ul className="mt-2 space-y-2 text-gray-700">
                <li>• Launch on Shopify</li>
                <li>• Expand to apparel</li>
                <li>• Scale partnerships</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-bold">Metrics</h3>
              <div className="mt-2 space-y-2">
                <div className="bg-white p-2 rounded">
                  <p className="text-sm font-semibold">Cost per scan</p>
                  <p className="text-green-600">$0.04</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-sm font-semibold">Revenue per scan</p>
                  <p className="text-green-600">$0.15-0.20</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: "Accelerator Partnership",
      content: (
        <div className="flex flex-col space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-blue-700">How We'll Grow Together</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Go-to-Market</h4>
              <p className="text-gray-700">Scale Shopify launch and build sales process with expert guidance</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Network</h4>
              <p className="text-gray-700">Connect with local tech and retail partners</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Expertise</h4>
              <p className="text-gray-700">Leverage B2B SaaS scaling experience</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold mb-2">Why Now?</h4>
            <p className="text-gray-700">Technical foundation built, early validation achieved - ready to scale with the right partner</p>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: "Join the Journey",
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-2xl font-bold text-center">Let's Transform Online Shopping Together</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Launch Ready</h3>
              <p className="text-gray-700">Shopify integration complete</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Growing</h3>
              <p className="text-gray-700">Klaviyo partnership discussions</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Expanding</h3>
              <p className="text-gray-700">Safety equipment validation</p>
            </div>
          </div>
          <div className="text-center space-y-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 mx-auto hover:bg-blue-700 transition-colors">
              <Play className="w-5 h-5" />
              <span>Try Our Demo</span>
            </button>
            <div className="space-y-2">
              <p className="font-semibold">Kokayi Cobb</p>
              <p>Founder, CEO & CTO</p>
              <p className="text-blue-600">Let's connect</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col">
          <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">
            {slides[currentSlide].title}
          </h1>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
        <div className="sticky bottom-4 flex justify-between items-center py-2 bg-white/80 backdrop-blur rounded-lg shadow-sm px-4 mt-8">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-6 w-6 text-blue-600" />
          </button>
          <div className="text-sm text-gray-500 font-medium">
            {currentSlide + 1} / {slides.length}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="h-6 w-6 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;