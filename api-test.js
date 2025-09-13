const fs = require('fs');
const path = require('path');

async function testFashnApi() {
  try {
    // Read images
    console.log('Reading images...');
    const modelImage = fs.readFileSync(path.join(__dirname, 'public', 'test-model.jpg'));
    const garmentImage = fs.readFileSync(path.join(__dirname, 'public', 'showcoat.jpg'));

    // Convert to base64
    console.log('Converting images to base64...');
    const modelBase64 = `data:image/jpeg;base64,${modelImage.toString('base64')}`;
    const garmentBase64 = `data:image/jpeg;base64,${garmentImage.toString('base64')}`;

    const testData = {
      model_image: modelBase64,
      garment_image: garmentBase64,
      category: "tops"
    };

    // Use environment variable for API key - NEVER hardcode secrets!
    const API_KEY = process.env.FASHN_API_KEY || process.env.NEXT_PUBLIC_VS_TOKEN;

    if (!API_KEY) {
      throw new Error('FASHN_API_KEY environment variable is required');
    }

    console.log('Sending request to FASHN API...');
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.id) {
      console.log('\nGot prediction ID:', data.id);
      console.log('Starting status polling...');
      
      // Poll for status
      let attempts = 0;
      while (attempts < 10) {
        console.log(`\nPoll attempt ${attempts + 1}...`);
        const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${data.id}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        
        const statusData = await statusResponse.json();
        console.log('Status:', JSON.stringify(statusData, null, 2));
        
        if (statusData.status === 'completed') {
          console.log('\nSuccess! Output URLs:', statusData.output);
          break;
        } else if (statusData.status === 'failed') {
          console.log('\nProcessing failed:', statusData.error);
          break;
        }
        
        attempts++;
        console.log('Waiting 2 seconds before next poll...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add fetch for Node.js environment
globalThis.fetch = globalThis.fetch || require('node-fetch');

testFashnApi();