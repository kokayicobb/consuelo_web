"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, Loader2, Download, RefreshCw, Check, Info, Upload, ArrowLeftRight, ImageIcon, Play, Shuffle } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

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

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export default function ModelGenerationContent() {
  // Model Options
  const [modelOptions, setModelOptions] = useState({
    gender: "female",
    ethnicity: "",
    pose: "natural"
  });
  
  // Clothing Options
  const [clothingOptions, setClothingOptions] = useState({
    type: "",
    color: "",
    style: "",
    material: ""
  });
  
  // Background Options
  const [backgroundOptions, setBackgroundOptions] = useState({
    setting: "studio white background",
    remove: true
  });
  
  // Brand Guidelines & Custom Prompt
  const [brandGuidelines, setBrandGuidelines] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState("");
  
  // Generated Images
  const [generatedImages, setGeneratedImages] = useState({
    original: null,
    transparent: null
  });
  
  // Background Options
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Available Options for Dropdowns
  const genderOptions = ["female", "male", "androgynous"];
  const ethnicityOptions = ["", "caucasian", "black", "asian", "hispanic", "middle eastern", "south asian"];
  const poseOptions = ["natural", "walking", "standing", "sitting", "casual", "elegant", "professional"];
  const clothingTypeOptions = [
    "", "t-shirt", "dress", "blouse", "pants", "skirt", "jacket", "coat", 
    "sweater", "suit", "casual wear", "formal wear", "sportswear", "swimwear"
  ];
  const colorOptions = [
    "", "red", "blue", "green", "black", "white", "yellow", "purple", 
    "pink", "orange", "brown", "gray", "navy", "teal", "gold", "silver"
  ];
  const styleOptions = [
    "", "casual", "formal", "business", "elegant", "trendy", "vintage", 
    "bohemian", "minimalist", "urban", "sporty", "luxury"
  ];
  const materialOptions = [
    "", "cotton", "silk", "wool", "linen", "denim", "leather", 
    "polyester", "nylon", "suede", "velvet", "satin"
  ];
  const backgroundSettings = [
    "studio white background", "studio gray background", "studio black background", 
    "natural outdoor lighting", "urban street", "minimalist interior"
  ];
  
  // Model Templates
  const modelTemplates = [
    { 
      id: 1, 
      preview: "/Caucasian red dress.jpg", 
      options: { gender: "female", pose: "elegant", ethnicity: "caucasian" },
      clothing: { type: "dress", color: "red", style: "formal" }
    },
    { 
      id: 2, 
      preview: "/black_casual.jpg", 
      options: { gender: "male", pose: "casual", ethnicity: "black" },
      clothing: { type: "t-shirt", color: "blue", style: "casual" }
    },
    { 
      id: 3, 
      preview: "/white_male.jpg", 
      options: { gender: "male", pose: "professional", ethnicity: "caucasian" },
      clothing: { type: "formal wear", color: "black", style: "business" }
    }
  ];

  // Simulate generation progress
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [isGenerating]);

  // Apply model template
  const applyModelTemplate = (template) => {
    setModelOptions({
      ...modelOptions,
      ...template.options
    });
    
    setClothingOptions({
      ...clothingOptions,
      ...template.clothing
    });
  };
  
  // Reset all options
  const resetOptions = () => {
    setModelOptions({
      gender: "female",
      ethnicity: "",
      pose: "natural"
    });
    
    setClothingOptions({
      type: "",
      color: "",
      style: "",
      material: ""
    });
    
    setBackgroundOptions({
      setting: "studio white background",
      remove: true
    });
    
    setBrandGuidelines("");
    setCustomPrompt("");
    setSelectedBackground(null);
  };
  
  // Handle generation
  const handleGenerate = async () => {
    if (!clothingOptions.type && !customPrompt) {
      setError("Please specify clothing type or add a custom prompt");
      return;
    }
    
    setIsGenerating(true);
    setGenerationStep("Creating professional fashion image...");
    setError("");
    setGeneratedImages({ original: null, transparent: null });
    
    try {
      // Simulating API call with a delay
      setTimeout(() => {
        setGeneratedImages({
          original: "/Caucasian red dress.jpg", // Using template image as a placeholder
          transparent: "/white_male.jpg" // Using template image as a placeholder
        });
        
        setIsGenerating(false);
        setGenerationStep("");
        setShowConfetti(true);
        
        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { 
            x: 0.5, 
            y: 0.5 
          },
          colors: ['#FF5E5B', '#D8D8D8', '#39A0ED'],
          zIndex: 1000,
        });
        
        // Reset confetti flag after animation
        setTimeout(() => setShowConfetti(false), 2500);
      }, 2000);
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate the fashion image. Please try again.');
      setGeneratedImages({ original: null, transparent: null });
      setIsGenerating(false);
      setGenerationStep("");
    }
  };
  
  // Download image
  const downloadImage = (imageUrl, filename) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename || 'fashion-model.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: custom * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    })
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Model Templates */}
      <motion.div 
        className="mb-6 rounded-xl bg-card p-6 shadow-sm border border-border/40 transition-all duration-300 hover:shadow-md"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        custom={0}
      >
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          QUICK START TEMPLATES
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {modelTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              className="aspect-[3/4] overflow-hidden rounded-lg bg-muted cursor-pointer relative group transition-all duration-300"
              onClick={() => applyModelTemplate(template)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={template.preview}
                alt={`Model template ${template.id}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 bg-accent rounded-full p-3 transition-all duration-300 scale-90 group-hover:scale-100"
                  initial={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Check className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-medium">{template.clothing.style} {template.clothing.color} {template.clothing.type}</p>
                <p className="text-sm opacity-80">{template.options.gender}, {template.options.pose} pose</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Model & Clothing Options */}
        <div className="space-y-6">
          {/* Model Options */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={1}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">MODEL OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Gender</label>
                <motion.select
                  value={modelOptions.gender}
                  onChange={(e) => setModelOptions({...modelOptions, gender: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Ethnicity (Optional)</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={modelOptions.ethnicity}
                  onChange={(e) => setModelOptions({...modelOptions, ethnicity: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {ethnicityOptions.map(option => (
                    <option key={option} value={option}>{option || "Any"}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Pose</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={modelOptions.pose}
                  onChange={(e) => setModelOptions({...modelOptions, pose: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {poseOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </motion.select>
              </div>
            </div>
          </motion.div>
          
          {/* Clothing Options */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={2}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">CLOTHING OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Type</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={clothingOptions.type}
                  onChange={(e) => setClothingOptions({...clothingOptions, type: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {clothingTypeOptions.map(option => (
                    <option key={option} value={option}>{option || "Any"}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Color</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={clothingOptions.color}
                  onChange={(e) => setClothingOptions({...clothingOptions, color: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {colorOptions.map(option => (
                    <option key={option} value={option}>{option || "Any"}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Style</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={clothingOptions.style}
                  onChange={(e) => setClothingOptions({...clothingOptions, style: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {styleOptions.map(option => (
                    <option key={option} value={option}>{option || "Any"}</option>
                  ))}
                </motion.select>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Material (Optional)</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={clothingOptions.material}
                  onChange={(e) => setClothingOptions({...clothingOptions, material: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {materialOptions.map(option => (
                    <option key={option} value={option}>{option || "Any"}</option>
                  ))}
                </motion.select>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Right Column: Background & Custom Options */}
        <div className="space-y-6">
          {/* Background Options */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={3}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">BACKGROUND OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-sm font-medium text-white">Initial Setting</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <motion.select
                  value={backgroundOptions.setting}
                  onChange={(e) => setBackgroundOptions({...backgroundOptions, setting: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {backgroundSettings.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </motion.select>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.input
                  type="checkbox"
                  id="removeBackground"
                  checked={backgroundOptions.remove}
                  onChange={(e) => setBackgroundOptions({...backgroundOptions, remove: e.target.checked})}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <label htmlFor="removeBackground" className="text-sm text-white">
                  Remove background after generation (transparent PNG)
                </label>
              </div>
            </div>
          </motion.div>
          
          {/* Custom Prompt */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={4}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">CUSTOM PROMPT</h2>
            
            <motion.textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific clothing details, style elements, or other creative direction not covered by the options above."
              className="h-24 w-full rounded-lg border border-border bg-background p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 placeholder:text-muted-foreground"
              whileHover={{ scale: 1.01 }}
              whileFocus={{ scale: 1.01, borderColor: "hsl(var(--accent))" }}
            />
          </motion.div>
          
          {/* Brand Guidelines */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={5}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">BRAND GUIDELINES (OPTIONAL)</h2>
            
            <motion.textarea
              value={brandGuidelines}
              onChange={(e) => setBrandGuidelines(e.target.value)}
              placeholder="Add brand-specific details like color schemes, photography style, or aesthetic guidelines."
              className="h-24 w-full rounded-lg border border-border bg-background p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 placeholder:text-muted-foreground"
              whileHover={{ scale: 1.01 }}
              whileFocus={{ scale: 1.01, borderColor: "hsl(var(--accent))" }}
            />
          </motion.div>
          
          {/* Generate Button */}
          <motion.div 
            className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={6}
          >
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex w-full items-center justify-center gap-1 rounded-md py-4 text-sm font-medium
                ${
                  isGenerating
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-accent text-white hover:bg-accent/80"
                }`}
              whileHover={!isGenerating ? { scale: 1.02 } : {}}
              whileTap={!isGenerating ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {generationStep || "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Fashion Model
                </>
              )}
            </motion.button>
            
            {isGenerating && (
              <div className="mt-4">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {generationProgress}% complete
                </div>
              </div>
            )}
            
            <motion.button
              onClick={resetOptions}
              className="mt-3 flex w-full items-center justify-center rounded-md border border-border py-2 text-sm font-medium text-white hover:bg-muted/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Options
            </motion.button>
            
            {error && (
              <motion.div 
                className="mt-4 flex items-center rounded-lg bg-destructive/20 p-3 text-destructive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      {(generatedImages.original || generatedImages.transparent) && (
        <motion.div 
          className="mt-8 rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <h2 className="mb-6 text-lg font-medium text-white">Generated Fashion Images</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Original Image */}
            {generatedImages.original && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground">ORIGINAL GENERATION</h3>
                <motion.div 
                  className="aspect-[3/4] overflow-hidden rounded-lg bg-background relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={generatedImages.original}
                    alt="Original fashion model"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.button
                  onClick={() => downloadImage(generatedImages.original, 'fashion-model.webp')}
                  className="flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-sm text-white hover:bg-muted/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </motion.button>
              </motion.div>
            )}
            
            {/* Transparent Image */}
            {generatedImages.transparent && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground">WITH TRANSPARENT BACKGROUND</h3>
                <motion.div 
                  className="aspect-[3/4] overflow-hidden rounded-lg relative group"
                  style={{
                    background: "repeating-conic-gradient(#222 0% 25%, #333 0% 50%)",
                    backgroundSize: "20px 20px",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={generatedImages.transparent}
                    alt="Fashion model with transparent background"
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
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
                <motion.button
                  onClick={() => downloadImage(generatedImages.transparent, 'fashion-model-transparent.png')}
                  className="flex w-full items-center justify-center gap-1 rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accent/80"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Transparent PNG
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Bottom Links - Similar to Try-on Studio */}
      <motion.div 
        className="mt-auto pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
          {["Pro", "Enterprise", "API", "Blog", "Careers", "Store", "Finance"].map((item, index) => (
            <motion.div 
              key={item} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                {item}
              </Link>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <div className="flex items-center gap-1">
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                English
              </Link>
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
                className="text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}