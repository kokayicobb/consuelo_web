// app/utils/prompt-helpers.js
// Shared utility functions for generating prompts

// Helper function to build enhanced fashion prompt
export function buildFashionPrompt(options) {
  const { modelOptions, clothingOptions, backgroundOptions, customPrompt, brandGuidelines } = options;
  
  // Base photography settings
  let prompt = "Professional fashion photography, high-end magazine quality, ";
  
  // Add model specifications
  if (modelOptions) {
    if (modelOptions.gender) {
      prompt += `${modelOptions.gender} model, `;
    }
    if (modelOptions.ethnicity && modelOptions.ethnicity !== "") {
      prompt += `${modelOptions.ethnicity} ethnicity, `;
    }
    if (modelOptions.pose) {
      prompt += `in ${modelOptions.pose} pose, `;
    }
  }
  
  // Add clothing specifications
  if (clothingOptions) {
    prompt += "wearing ";
    
    if (clothingOptions.color && clothingOptions.color !== "") {
      prompt += `${clothingOptions.color} `;
    }
    
    if (clothingOptions.material && clothingOptions.material !== "") {
      prompt += `${clothingOptions.material} `;
    }
    
    if (clothingOptions.type && clothingOptions.type !== "") {
      prompt += `${clothingOptions.type} `;
    } else {
      prompt += "clothing ";
    }
    
    if (clothingOptions.style && clothingOptions.style !== "") {
      prompt += `in ${clothingOptions.style} style, `;
    }
  }
  
  // Add background specification
  if (backgroundOptions && backgroundOptions.setting) {
    prompt += `${backgroundOptions.setting}, `;
  }
  
  // Add lighting and photography style
  prompt += "professional studio lighting, soft shadows, detailed fabric texture, ";
  
  // Add brand guidelines if provided
  if (brandGuidelines && brandGuidelines.trim() !== "") {
    prompt += `${brandGuidelines}, `;
  }
  
  // Add custom prompt if provided
  if (customPrompt && customPrompt.trim() !== "") {
    prompt += `${customPrompt}, `;
  }
  
  // Add final quality parameters
  prompt += "8k ultra detailed, professional color grading, sharp focus, fashion magazine quality";
  
  return prompt;
}

// Build negative prompt to avoid common fashion AI generation issues
export function buildNegativePrompt() {
  return "distorted clothing, deformed body, unrealistic proportions, extra limbs, " +
    "missing limbs, floating limbs, disconnected limbs, malformed hands, extra fingers, " +
    "missing fingers, poorly drawn face, blurry, low quality, disfigured, duplicate clothing";
}