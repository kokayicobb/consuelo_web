"use client"
// ProductPage.js - Example e-commerce product page

import React, { useState } from 'react';
import ConsueloTryOn from './ConsueloTryOn'; // Import the try-on component

const ProductPage = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  
  // Product data (would typically come from your e-commerce platform/CMS)
  const product = {
    id: 'prod_12345',
    name: 'Classic Fit Oxford Shirt',
    brand: 'Fashion Brand',
    price: 79.99,
    description: 'A timeless Oxford shirt made from premium cotton with a comfortable classic fit.',
    image: 'https://example.com/images/classic-oxford-shirt.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    colors: ['White', 'Blue', 'Pink']
  };
  
  // Your Consuelo API key
  const CONSUELO_API_KEY = 'ac886638.9233a99fd8dbe2ecd6c0b9d489a6006ff22bad50fbeecda17fa58abf';
  
  // Handle try-on success
  const handleTryOnSuccess = (data) => {
    console.log('Try-on initiated successfully:', data);
    // You could trigger analytics events here
  };
  
  // Handle try-on errors
  const handleTryOnError = (error) => {
    console.error('Try-on error:', error);
    // You could log this to your error tracking system
  };

  return (
    <div className="product-page">
      <div className="product-container" style={{ 
        display: 'flex', 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Product Image */}
        <div className="product-image" style={{ flex: '1', marginRight: '40px' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
        
        {/* Product Info */}
        <div className="product-info" style={{ flex: '1' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>{product.name}</h1>
          <p style={{ color: '#666', marginBottom: '16px' }}>{product.brand}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>${product.price}</p>
          
          <p style={{ marginBottom: '24px' }}>{product.description}</p>
          
          {/* Size Selection */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Size</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '8px 16px',
                    border: selectedSize === size ? '2px solid #000' : '1px solid #ddd',
                    background: selectedSize === size ? '#f8f8f8' : 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Quantity</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '4px 0 0 4px',
                  cursor: 'pointer'
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{
                  width: '50px',
                  height: '36px',
                  border: '1px solid #ddd',
                  borderLeft: 'none',
                  borderRight: 'none',
                  textAlign: 'center'
                }}
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button 
              style={{
                flex: '1',
                padding: '14px 24px',
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
            
            <button 
              style={{
                padding: '14px 24px',
                backgroundColor: 'white',
                color: '#000',
                border: '1px solid #000',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
          
          {/* Consuelo Virtual Try-On Button */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
            <ConsueloTryOn
              apiKey={CONSUELO_API_KEY}
              productId={product.id}
              productType="clothing"
              productImage={product.image}
              productName={product.name}
              brandName={product.brand}
              onSuccess={handleTryOnSuccess}
              onError={handleTryOnError}
            />
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              See how this will look on you with our virtual try-on technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;