"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  Users,
  TrendingUp,
  Code,
  Brain,
  Trophy,
  Target,
  Play,
  Link,
} from "lucide-react";
import { Button } from "../ui/button";

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(false);

  const slides = [
    {
      id: 1,
      title: "The Future of Online Shopping",
      content: (
        <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
          <div className="text-4xl font-bold text-primary">Consuelo</div>
          <div className="text-xl text-gray-600">See it. Try it. Buy it.</div>
          <img
            src="/apple-touch-icon.png"
            alt="Consuelo Logo"
            className="h-16 w-16 object-contain"
          />
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-4 rounded-lg bg-rose-50 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-rose-800">The Reality</h3>
            <div className="text-6xl font-bold text-rose-700">48%</div>
            <p className="text-gray-700">
              of online clothes don't fit as expected
            </p>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-rose-600" />
              <p className="text-sm text-gray-600">
                Millions struggle with fit uncertainty
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-violet-800">
                Plus-Size Market Pain
              </h4>
              <p className="text-3xl font-bold text-violet-700">$304B+</p>
              <p className="text-sm text-gray-600">
                market limited by fit uncertainty
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-indigo-800">
                Current Solutions
              </h4>
              <p className="text-gray-600">Basic size charts/predictions</p>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Kokayi's Card */}
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
                  <Code className="h-10 w-10 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Kokayi Cobb</h3>
                  <p className="text-sm text-gray-600">Founder, CEO & CTO</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <Brain className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">
                    Technical Expertise
                  </span>
                </div>
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">
                    Business Strategy
                  </span>
                </div>
              </div>
            </div>

            {/* Bruce's Card */}
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
                  <Code className="h-10 w-10 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Bruce Wene</h3>
                  <p className="text-sm text-gray-600">
                    Software Engineer
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <Code className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">
                    10 Years Experience
                  </span>
                </div>
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <Brain className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">AI Enthusiast</span>
                </div>
              </div>
            </div>

            {/* Dakota's Card */}
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
                  <Code className="h-10 w-10 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Dakota Chanthakoummane
                  </h3>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <Code className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">UNCC Senior</span>
                </div>
                <div className="flex items-center space-x-2 rounded-lg bg-white p-3">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-gray-700">Rising Talent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-rose-50 p-6 shadow-lg">
              <h4 className="mb-2 font-bold">Global Talent</h4>
              <p className="text-gray-700">
                Distributed team across London and Charlotte, bringing diverse
                perspectives to solve e-commerce challenges
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-6 shadow-lg">
              <h4 className="mb-2 font-bold">Growing Team</h4>
              <p className="text-gray-700">
                Combining seasoned experience with fresh talent to drive
                innovation
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "A Personal Journey",
      content: (
        <div className="flex flex-col space-y-6 rounded-lg bg-rose-50 p-6 shadow-lg">
          <div className="space-y-4">
            <div className="text-xl font-semibold text-rose-800">
              "Someone should fix this..."
            </div>
            <p className="text-gray-700">
              It started with a trip to visit family. Half the clothes I ordered
              online didn't fit. Sitting on that plane, frustrated, I realized -
              I'm a developer. I could solve this.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold">The Problem</p>
              <p className="text-gray-600">Uncertainty in online shopping</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold">The Journey</p>
              <p className="text-gray-600">From B2C app to B2B solution</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold">The Mission</p>
              <p className="text-gray-600">
                Bridge the gap between online and in person{" "}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Transforming the Experience",
      content: (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-4 rounded-lg bg-violet-50 p-6 shadow-lg">
            <h3 className="text-xl font-bold">Try-On Studio</h3>
            <p className="text-gray-700">
              See exactly how clothes will look on you
            </p>
            <div className="rounded-lg bg-white p-4">
              <p className="font-semibold">Powered by Diffusion AI</p>
              <p className="text-sm text-gray-600">
                One photo creates endless try-ons
              </p>
            </div>
            <div className="text-sm text-violet-600">
              From uncertainty to confidence
            </div>
          </div>
          <div className="flex flex-col space-y-4 rounded-lg bg-indigo-50 p-6 shadow-lg">
            <h3 className="text-xl font-bold">Fit Calculator</h3>
            <p className="text-gray-700">Precise fit predictions</p>
            <div className="rounded-lg bg-white p-4">
              <p className="font-semibold">Smart Measurements</p>
              <p className="text-sm text-gray-600">
                From helmets to full apparel
              </p>
            </div>
            <div className="text-sm text-indigo-600">
              From guessing to knowing
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Market Opportunity",
      content: (
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-rose-50 p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-rose-600">$304B+</div>
              <div className="text-sm">Plus-Size Market</div>
            </div>
            <div className="rounded-lg bg-violet-50 p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-violet-600">$4.3B</div>
              <div className="text-sm">Safety Equipment</div>
            </div>
            <div className="rounded-lg bg-indigo-50 p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-indigo-600">20-36%</div>
              <div className="text-sm">
                Industry Return Rate Reduction*
              </div>
              <div className="mt-2 text-xs text-gray-500">
                *Visual try-on only. Our dual approach targets even higher
                impact.
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 shadow-lg">
            <h3 className="mb-4 font-bold">Fit Calculator Expansion Path</h3>
            <div className="flex items-center space-x-4">
              <div className="text-violet-600">Helmets/Safety Gear</div>
              <ArrowRight className="h-4 w-4" />
              <div className="text-violet-600">All Categories</div>
              <ArrowRight className="h-4 w-4" />
              <div className="text-violet-600">
                Combine with Try-On Studio
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Why We Win",
      content: (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-rose-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">
              Current Market Solutions
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">
                  Visual Try-On Only (Zeekit/Walmart)
                </p>
                <p className="text-sm text-gray-600">
                  Shows appearance but not true fit
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">Basic Size Charts</p>
                <p className="text-sm text-gray-600">
                  Generic measurements only
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">Incomplete Solutions</p>
                <p className="text-sm text-gray-600">
                  Missing either visual preview or precise measurements
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">
              Our Complete Solution
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">
                  Visual + Technical Approach
                </p>
                <p className="text-sm text-gray-600">
                  See the look AND confirm the fit
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">Smart Measurement Engine</p>
                <p className="text-sm text-gray-600">
                  AI-powered precise fit prediction
                </p>
              </div>
              <div className="rounded-lg bg-white p-4">
                <p className="font-semibold">Beyond Just Clothes</p>
                <p className="text-sm text-gray-600">
                  Expanding to safety equipment and specialized gear
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: "Our Advantage",
      content: (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg bg-indigo-50 p-6 shadow-lg">
              <h3 className="mb-2 font-bold">Product Economics</h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4">
                  <p className="font-semibold">Fit Calculator</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs">Cost</div>
                      <div className="text-lg font-bold text-indigo-600">
                        $0.001
                      </div>
                      <div className="text-xs text-gray-500">
                        On-device processing
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="text-xs">Revenue</div>
                      <div className="text-lg font-bold text-indigo-600">
                        $0.15-0.20
                      </div>
                      <div className="text-xs text-gray-500">
                        per scan
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="font-semibold">Try-On Studio</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs">Cost</div>
                      <div className="text-lg font-bold text-indigo-600">
                        $0.04
                      </div>
                      <div className="text-xs text-gray-500">
                        AI processing
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="text-xs">Revenue</div>
                      <div className="text-lg font-bold text-indigo-600">
                        $0.15-0.20
                      </div>
                      <div className="text-xs text-gray-500">
                        per scan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <h3 className="mb-2 font-bold">Technology</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span>Client-side fit calculations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span>Advanced diffusion AI for try-ons</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg bg-rose-50 p-6 shadow-lg">
            <h3 className="mb-4 font-bold">Revenue Model</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                <div className="font-bold">Starter</div>
                <div className="text-rose-600">$20/100 scans</div>
                <div className="text-sm text-gray-600">Perfect for testing</div>
              </div>
              <div className="rounded-lg bg-white p-4">
                <div className="font-bold">Growth</div>
                <div className="text-rose-600">$49/month</div>
                <div className="text-sm text-gray-600">
                  300 scans included
                </div>
              </div>
              <div className="rounded-lg bg-white p-4">
                <div className="font-bold">Scale</div>
                <div className="text-rose-600">$299/month</div>
                <div className="text-sm text-gray-600">
                  2,500 scans included
                </div>
              </div>
              <div className="rounded-lg bg-white p-4">
                <div className="font-bold">Enterprise</div>
                <div className="text-rose-600">Custom</div>
                <div className="text-sm text-gray-600">
                  Custom volume + dedicated support
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: "Accelerator Partnership",
      content: (
        <div className="flex flex-col space-y-6">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-bold text-violet-700">
              How We'll Grow Together
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <h4 className="mb-2 font-bold">Go-to-Market</h4>
              <p className="text-gray-700">
                Scale Shopify launch and build sales process with expert
                guidance
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-6 shadow-lg">
              <h4 className="mb-2 font-bold">Network</h4>
              <p className="text-gray-700">
                Connect with tech and retail partners
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-6 shadow-lg">
              <h4 className="mb-2 font-bold">Expertise</h4>
              <p className="text-gray-700">
                Leverage B2B SaaS scaling experience
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 shadow-lg">
            <h4 className="mb-2 font-bold">Why Now?</h4>
            <p className="text-gray-700">
              Technical foundation built, early validation achieved - ready to
              scale with the right partner
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      title: "Join the Journey",
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center text-2xl font-bold">
            Let's Transform Online Shopping Together
          </div>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-violet-50 p-6 shadow-lg">
              <h3 className="mb-2 font-bold">Launch Ready</h3>
              <p className="text-gray-700">
                Shopify integration complete
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-6 shadow-lg">
              <h3 className="mb-2 font-bold">Growing</h3>
              <p className="text-gray-700">
                Klaviyo partnership discussions
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 p-6 shadow-lg">
              <h3 className="mb-2 font-bold">Expanding</h3>
              <p className="text-gray-700">
                Safety equipment validation
              </p>
            </div>
          </div>
          <div className="space-y-4 text-center">
            <Button
              variant="default"
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2"
              onClick={() => (window.location.href = "/playground")}
            >
              <Play className="h-5 w-5" />
              Try Our Demo
            </Button>
            <div className="space-y-2">
              <p className="font-semibold">Kokayi Cobb</p>
              <p>Founder, CEO & CTO</p>
              <p className="text-violet-600">Let's connect</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const changeSlide = (newSlide) => {
    setFade(true);
    // Delay updating the slide to allow the fade-out animation to play
    setTimeout(() => {
      setCurrentSlide(newSlide);
      setFade(false);
    }, 300);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      changeSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      changeSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-accent/5 to-accent/2">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        <div className="flex flex-grow flex-col">
          <h1 className="mb-8 text-center text-4xl font-bold text-accent">
            {slides[currentSlide].title}
          </h1>
          <div className="flex flex-grow items-center justify-center">
            <div
              key={currentSlide}
              className={`w-full transition-opacity duration-500 ${
                fade ? "opacity-0" : "opacity-100"
              }`}
            >
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-full bg-white/90 px-6 py-3 shadow-xl backdrop-blur">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center justify-center rounded-full bg-violet-100 p-3 transition-colors duration-200 hover:bg-violet-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6 text-violet-600" />
          </button>
          <div className="flex items-center space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                onClick={() => changeSlide(index)}
                className={`h-2 w-10 cursor-pointer rounded-full ${
                  index === currentSlide
                    ? "bg-violet-600"
                    : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center justify-center rounded-full bg-violet-100 p-3 transition-colors duration-200 hover:bg-violet-200 disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6 text-violet-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
