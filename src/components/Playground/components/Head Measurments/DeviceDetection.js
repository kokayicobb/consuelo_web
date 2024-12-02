// app/components/DeviceDetection
"use client"
import { useEffect, useState } from 'react';

// Device database with screen dimensions and PPI
const DEVICE_SPECS = {
  // iPhone models
  'iPhone X': { ppi: 458, screenWidth: 2436, screenHeight: 1125 },
  'iPhone XS': { ppi: 458, screenWidth: 2436, screenHeight: 1125 },
  'iPhone XS Max': { ppi: 458, screenWidth: 2688, screenHeight: 1242 },
  'iPhone XR': { ppi: 326, screenWidth: 1792, screenHeight: 828 },
  'iPhone 11': { ppi: 326, screenWidth: 1792, screenHeight: 828 },
  'iPhone 11 Pro': { ppi: 458, screenWidth: 2436, screenHeight: 1125 },
  'iPhone 11 Pro Max': { ppi: 458, screenWidth: 2688, screenHeight: 1242 },
  'iPhone 12': { ppi: 460, screenWidth: 2532, screenHeight: 1170 },
  'iPhone 12 Mini': { ppi: 476, screenWidth: 2340, screenHeight: 1080 },
  'iPhone 12 Pro': { ppi: 460, screenWidth: 2532, screenHeight: 1170 },
  'iPhone 12 Pro Max': { ppi: 458, screenWidth: 2778, screenHeight: 1284 },
  'iPhone 13': { ppi: 460, screenWidth: 2532, screenHeight: 1170 },
  'iPhone 13 Mini': { ppi: 476, screenWidth: 2340, screenHeight: 1080 },
  'iPhone 13 Pro': { ppi: 460, screenWidth: 2532, screenHeight: 1170 },
  'iPhone 13 Pro Max': { ppi: 458, screenWidth: 2778, screenHeight: 1284 },
  'iPhone 14': { ppi: 460, screenWidth: 2532, screenHeight: 1170 },
  'iPhone 14 Plus': { ppi: 458, screenWidth: 2778, screenHeight: 1284 },
  'iPhone 14 Pro': { ppi: 460, screenWidth: 2556, screenHeight: 1179 },
  'iPhone 14 Pro Max': { ppi: 460, screenWidth: 2796, screenHeight: 1290 },
  'iPhone 15': { ppi: 460, screenWidth: 2556, screenHeight: 1179 },
  'iPhone 15 Plus': { ppi: 458, screenWidth: 2796, screenHeight: 1290 },
  'iPhone 15 Pro': { ppi: 460, screenWidth: 2556, screenHeight: 1179 },
  'iPhone 15 Pro Max': { ppi: 460, screenWidth: 2796, screenHeight: 1290 },

  // Samsung Galaxy S models
  'Galaxy S14': { ppi: 425, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S14+': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },
  'Galaxy S14 Ultra': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },
  'Galaxy S23': { ppi: 425, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S23+': { ppi: 393, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S23 Ultra': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },
  'Galaxy S22': { ppi: 425, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S22+': { ppi: 393, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S22 Ultra': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },
  'Galaxy S21': { ppi: 421, screenWidth: 2400, screenHeight: 1080 },
  'Galaxy S21+': { ppi: 394, screenWidth: 2400, screenHeight: 1080 },
  'Galaxy S21 Ultra': { ppi: 515, screenWidth: 3200, screenHeight: 1440 },
  'Galaxy S20': { ppi: 421, screenWidth: 2400, screenHeight: 1080 },
  'Galaxy S20+': { ppi: 525, screenWidth: 3200, screenHeight: 1440 },
  'Galaxy S20 Ultra': { ppi: 511, screenWidth: 3200, screenHeight: 1440 },
  'Galaxy S15': { ppi: 425, screenWidth: 2340, screenHeight: 1080 },
  'Galaxy S15+': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },
  'Galaxy S15 Ultra': { ppi: 500, screenWidth: 3088, screenHeight: 1440 },

  // MacBooks
'MacBook Pro 14-inch 2023': { ppi: 254, screenWidth: 3024, screenHeight: 1964 },
'MacBook Pro 16-inch 2023': { ppi: 254, screenWidth: 3456, screenHeight: 2234 },
'MacBook Pro 13-inch 2022': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Air M2 2022': { ppi: 224, screenWidth: 2560, screenHeight: 1664 },
'MacBook Air M1 2020': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Pro 16-inch 2021': { ppi: 254, screenWidth: 3456, screenHeight: 2234 },
'MacBook Pro 14-inch 2021': { ppi: 254, screenWidth: 3024, screenHeight: 1964 },
'MacBook Pro 13-inch 2020': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Pro 16-inch 2019': { ppi: 226, screenWidth: 3072, screenHeight: 1920 },
'MacBook Pro 15-inch 2019': { ppi: 220, screenWidth: 2880, screenHeight: 1800 },
'MacBook Pro 13-inch 2019': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Air 2019': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Pro 15-inch 2018': { ppi: 220, screenWidth: 2880, screenHeight: 1800 },
'MacBook Pro 13-inch 2018': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Air 2018': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'MacBook Pro 15-inch 2017': { ppi: 220, screenWidth: 2880, screenHeight: 1800 },
'MacBook Pro 13-inch 2017': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },

// Popular Windows Laptops (Based on 2023-2024 market share and popularity)
'Dell XPS 15': { ppi: 290, screenWidth: 3456, screenHeight: 2160 },
'Dell XPS 13': { ppi: 290, screenWidth: 2880, screenHeight: 1800 },
'Lenovo ThinkPad X1 Carbon': { ppi: 227, screenWidth: 2560, screenHeight: 1600 },
'HP Spectre x360': { ppi: 282, screenWidth: 3840, screenHeight: 2160 },
'Razer Blade 15': { ppi: 240, screenWidth: 3840, screenHeight: 2160 },
'ASUS ROG Zephyrus G14': { ppi: 216, screenWidth: 2560, screenHeight: 1600 },
'Microsoft Surface Laptop 5': { ppi: 201, screenWidth: 2256, screenHeight: 1504 },
'Lenovo Legion 5 Pro': { ppi: 188, screenWidth: 2560, screenHeight: 1600 },
'Acer Swift 5': { ppi: 207, screenWidth: 1920, screenHeight: 1200 },
'HP Envy x360': { ppi: 166, screenWidth: 1920, screenHeight: 1080 },

// Update the Default Desktop specs to be more accurate for modern screens
'Default Desktop': { ppi: 109, screenWidth: 2560, screenHeight: 1440 }, // QHD is now more common than 1080p
  'Default Mobile': { ppi: 400, screenWidth: 1170, screenHeight: 2532 }
};



export default function DeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    detectedDevice: 'Unknown',
    screenWidth: 0,
    screenHeight: 0,
    ppi: 0,
    deviceType: 'Unknown',
    rawValues: {} // For debugging
  });

  useEffect(() => {
    function detectDevice() {
      // Get screen dimensions accounting for iOS quirks
      const screenWidth = Math.max(
        window.screen.width * window.devicePixelRatio,
        window.screen.height * window.devicePixelRatio
      );
      const screenHeight = Math.min(
        window.screen.width * window.devicePixelRatio,
        window.screen.height * window.devicePixelRatio
      );

      // iOS Safari specific adjustments
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;

      // Debug values
      const rawValues = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isIOS,
        isPortrait
      };

      // Function to calculate how close dimensions match
      const dimensionMatch = (spec) => {
        // For iOS devices, we need to be more flexible with the matching
        // due to potential orientation and scaling issues
        const widthDiff = Math.abs(spec.screenWidth - screenWidth);
        const heightDiff = Math.abs(spec.screenHeight - screenHeight);
        
        // Also try the reverse orientation
        const altWidthDiff = Math.abs(spec.screenWidth - screenHeight);
        const altHeightDiff = Math.abs(spec.screenHeight - screenWidth);

        return Math.min(
          widthDiff + heightDiff,
          altWidthDiff + altHeightDiff
        );
      };

      let bestMatch = {
        device: 'Unknown',
        spec: null,
        difference: Infinity
      };

      Object.entries(DEVICE_SPECS).forEach(([device, spec]) => {
        const difference = dimensionMatch(spec);
        if (difference < bestMatch.difference) {
          bestMatch = { device, spec, difference };
        }
      });

      // More lenient threshold for iOS devices
      const matchThreshold = isIOS ? 1000 : 500;
      
      // Determine device type
      const deviceType = 
        window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
          ? 'Mobile' 
          : 'Desktop';

      // If no close match found, use default values
      if (bestMatch.difference > matchThreshold) {
        bestMatch.device = `Default ${deviceType}`;
        bestMatch.spec = DEVICE_SPECS[`Default ${deviceType}`];
      }

      setDeviceInfo({
        detectedDevice: bestMatch.device,
        screenWidth,
        screenHeight,
        ppi: bestMatch.spec.ppi,
        deviceType,
        rawValues // Include raw values for debugging
      });
    }

    // Initial detection
    detectDevice();

    // Add resize listener
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return 
  (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Device Detection</h1>
      <div className="space-y-2">
        <p><strong>Detected Device:</strong> {deviceInfo.detectedDevice}</p>
        <p><strong>Device Type:</strong> {deviceInfo.deviceType}</p>
        <p><strong>Screen Resolution:</strong> {deviceInfo.screenWidth} x {deviceInfo.screenHeight}</p>
        <p><strong>PPI:</strong> {deviceInfo.ppi}</p>
        
        {/* Debug information */}
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Debug Values:</h2>
          <pre className="text-sm">
            {JSON.stringify(deviceInfo.rawValues, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}