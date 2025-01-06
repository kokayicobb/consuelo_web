const fs = require('fs');
const path = require('path');

// Read and encode images
const modelImage = fs.readFileSync(path.join(__dirname, 'public', 'test-model.jpg'));
const garmentImage = fs.readFileSync(path.join(__dirname, 'public', 'showcoat.jpg'));

const modelBase64 = `data:image/jpeg;base64,${modelImage.toString('base64')}`;
const garmentBase64 = `data:image/jpeg;base64,${garmentImage.toString('base64')}`;

// Create the curl command
const curlCommand = `curl -X POST https://api.fashn.ai/v1/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB" \\
  -d '{
    "model_image": "${modelBase64}",
    "garment_image": "${garmentBase64}",
    "category": "tops"
  }'`;

// Write the curl command to a file
fs.writeFileSync('test-curl.sh', curlCommand);
console.log('Curl command has been written to test-curl.sh');

// Also create a JSON file for testing
const testData = {
  model_image: modelBase64,
  garment_image: garmentBase64,
  category: "tops"
};

fs.writeFileSync('test-payload.json', JSON.stringify(testData, null, 2));
console.log('Test payload has been written to test-payload.json');