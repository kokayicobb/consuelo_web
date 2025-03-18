//src/components/Dashboard/model-generation-content.tsx
"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertCircle, Loader2, Download, RefreshCw, Check } from "lucide-react";

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
  
  // Model Templates (Reduced to 3 as requested)
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
      // This is the real implementation that calls your API endpoint
      const response = await fetch('/api/generate-fashion-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelOptions,
          clothingOptions,
          backgroundOptions,
          customPrompt,
          brandGuidelines,
          selectedBackground
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got an error message but still have images
      if (data.error) {
        setError(data.error);
      }
      
      // Check if we have at least one image
      if (data.imageUrl) {
        setGeneratedImages({
          original: data.imageUrl,
          transparent: data.transparentImageUrl || null
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate the fashion image. Please try again.');
      setGeneratedImages({ original: null, transparent: null });
    } finally {
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

  // Animation classes
  const cardClasses = "rounded-xl bg-card p-6 shadow-sm border border-border/40 transition-all duration-300 hover:shadow-md dark:bg-[#1c1c1e] dark:border-gray-800/60 dark:hover:border-gray-700/60";
  const templateCardClasses = "aspect-[3/4] overflow-hidden rounded-lg bg-muted cursor-pointer relative group transition-all duration-300 dark:bg-background";
  const buttonClasses = "flex w-full items-center justify-center rounded-lg py-2 font-medium transition-all duration-300";
  const selectClasses = "w-full rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 dark:bbg-background dark:border-gray-800 dark:text-gray-200";
  
  return (
    <div className="mx-auto max-w-6xl">
      {/* Model Templates */}
      <div className={`mb-6 ${cardClasses}`}>
        <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">
          QUICK START TEMPLATES
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {modelTemplates.map((template) => (
            <div
              key={template.id}
              className={templateCardClasses}
              onClick={() => applyModelTemplate(template)}
            >
              <img
                src={template.preview}
                alt={`Model template ${template.id}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                <div className="opacity-0 group-hover:opacity-100 bg-accent rounded-full p-3 transition-all duration-300 scale-90 group-hover:scale-100">
                  <Check className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-medium">{template.clothing.style} {template.clothing.color} {template.clothing.type}</p>
                <p className="text-sm opacity-80">{template.options.gender}, {template.options.pose} pose</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Model & Clothing Options */}
        <div className="space-y-6">
          {/* Model Options */}
          <div className={cardClasses}>
            <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">MODEL OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Gender</label>
                <select
                  value={modelOptions.gender}
                  onChange={(e) => setModelOptions({...modelOptions, gender: e.target.value})}
                  className={selectClasses}
                >
                  {genderOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ethnicity (Optional)</label>
                <select
                  value={modelOptions.ethnicity}
                  onChange={(e) => setModelOptions({...modelOptions, ethnicity: e.target.value})}
                  className={selectClasses}
                >
                  {ethnicityOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option || "Any"}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Pose</label>
                <select
                  value={modelOptions.pose}
                  onChange={(e) => setModelOptions({...modelOptions, pose: e.target.value})}
                  className={selectClasses}
                >
                  {poseOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Clothing Options */}
          <div className={cardClasses}>
            <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">CLOTHING OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Type</label>
                <select
                  value={clothingOptions.type}
                  onChange={(e) => setClothingOptions({...clothingOptions, type: e.target.value})}
                  className={selectClasses}
                >
                  {clothingTypeOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option || "Any"}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
                <select
                  value={clothingOptions.color}
                  onChange={(e) => setClothingOptions({...clothingOptions, color: e.target.value})}
                  className={selectClasses}
                >
                  {colorOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option || "Any"}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Style</label>
                <select
                  value={clothingOptions.style}
                  onChange={(e) => setClothingOptions({...clothingOptions, style: e.target.value})}
                  className={selectClasses}
                >
                  {styleOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option || "Any"}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Material (Optional)</label>
                <select
                  value={clothingOptions.material}
                  onChange={(e) => setClothingOptions({...clothingOptions, material: e.target.value})}
                  className={selectClasses}
                >
                  {materialOptions.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option || "Any"}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Background & Custom Options */}
        <div className="space-y-6">
          {/* Background Options */}
          <div className={cardClasses}>
            <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">BACKGROUND OPTIONS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Initial Setting</label>
                <select
                  value={backgroundOptions.setting}
                  onChange={(e) => setBackgroundOptions({...backgroundOptions, setting: e.target.value})}
                  className={selectClasses}
                >
                  {backgroundSettings.map(option => (
                    <option key={option} value={option} className="bg-background text-foreground">{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="removeBackground"
                  checked={backgroundOptions.remove}
                  onChange={(e) => setBackgroundOptions({...backgroundOptions, remove: e.target.checked})}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="removeBackground" className="text-sm text-foreground">
                  Remove background after generation (transparent PNG)
                </label>
              </div>
            </div>
          </div>
          
          {/* Custom Prompt */}
          <div className={cardClasses}>
            <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">CUSTOM PROMPT</h2>
            
                          <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific clothing details, style elements, or other creative direction not covered by the options above."
              className="h-24 w-full rounded-lg border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 dark:bbg-background dark:border-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Brand Guidelines */}
          <div className={cardClasses}>
            <h2 className="mb-4 text-sm font-medium text-gray-400 dark:text-gray-500">BRAND GUIDELINES (OPTIONAL)</h2>
            
                          <textarea
              value={brandGuidelines}
              onChange={(e) => setBrandGuidelines(e.target.value)}
              placeholder="Add brand-specific details like color schemes, photography style, or aesthetic guidelines."
              className="h-24 w-full rounded-lg border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 dark:bg-background dark:border-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Generate Button */}
          <div className={cardClasses}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`${buttonClasses} py-4 ${
                isGenerating
                  ? "cursor-not-allowed bg-muted text-muted-foreground dark:bg-gray-800 dark:text-gray-500"
                  : "bg-accent text-white hover:bg-accent/80 hover:scale-[1.02] active:scale-[0.98] dark:bg-purple-700 dark:hover:bg-purple-600"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {generationStep || "Generating..."}
                </>
              ) : (
                <>
                 
                  Generate Fashion Model
                </>
              )}
            </button>
            
            {isGenerating && (
              <div className="mt-4">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden dark:bg-gray-800">
                  <div 
                    className="h-full bg-accent transition-all duration-300 dark:bg-purple-600" 
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center dark:text-gray-400">
                  {generationProgress}% complete
                </div>
              </div>
            )}
            
            <button
              onClick={resetOptions}
              className={`${buttonClasses} mt-3 border border-border text-foreground hover:bg-background/60 hover:scale-[1.01] active:scale-[0.99] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/60`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Options
            </button>
            
            {error && (
              <div className="mt-4 flex items-center rounded-lg bg-destructive/20 p-3 text-destructive animate-fade-in">
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {(generatedImages.original || generatedImages.transparent) && (
        <div className={`mt-8 ${cardClasses}`}>
          <h2 className="mb-6 text-lg font-medium text-foreground dark:text-gray-200">Generated Fashion Images</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Original Image */}
            {generatedImages.original && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">ORIGINAL GENERATION</h3>
                <div 
                  className="aspect-[3/4] overflow-hidden rounded-lg bg-background relative group transition-all duration-300 hover:shadow-lg dark:bg-background"
                >
                  <img
                    src={generatedImages.original}
                    alt="Original fashion model"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <button
                  onClick={() => downloadImage(generatedImages.original, 'fashion-model.webp')}
                  className={`${buttonClasses} border border-border text-foreground hover:bg-background/60 hover:translate-y-[-2px] active:translate-y-[0px] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/60`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </button>
              </div>
            )}
            
            {/* Transparent Image */}
            {generatedImages.transparent && (
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">WITH TRANSPARENT BACKGROUND</h3>
                <div 
                  className="aspect-[3/4] overflow-hidden rounded-lg relative group transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: "repeating-conic-gradient(#222 0% 25%, #333 0% 50%)",
                    backgroundSize: "20px 20px",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                  }}
                >
                  <img
                    src={generatedImages.transparent}
                    alt="Fashion model with transparent background"
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <button
                  onClick={() => downloadImage(generatedImages.transparent, 'fashion-model-transparent.png')}
                  className={`${buttonClasses} bg-accent text-white hover:bg-accent/80 hover:translate-y-[-2px] active:translate-y-[0px] dark:bg-purple-700 dark:hover:bg-purple-600`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Transparent PNG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}