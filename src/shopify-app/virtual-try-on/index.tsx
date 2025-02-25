import TryOnButton from '@/components/Playground/components/Virtual Try On';
import React from 'react';


const ProductTryOn = ({ product }) => {
  // Extract garment image and category from the product object.
  // Adjust these property names as needed for your data model.
  const garmentImage = product.imageUrl;
  const category = product.category;

  // A callback to receive the result from TryOnButton
  const handleTryOnResult = (result) => {
    console.log('Virtual try-on result:', result);
    // You can process or save the result here as needed.
  };

  return (
    <div className="product-tryon-section">
      <h2>{product.title}</h2>
      {/* Optionally show the product image */}
      <img 
        src={garmentImage} 
        alt={product.title} 
        className="product-image"
      />
      {/* Call the TryOnButton component */}
      <TryOnButton 
        garmentImage={garmentImage}
        category={category}
        onResult={handleTryOnResult}
      />
    </div>
  );
};

export default ProductTryOn;
