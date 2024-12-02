// app/providers/DeviceProvider.js
"use client"
import { DeviceContext } from '../context/DeviceContext';
import DeviceDetect from '../components/Head Measurments/DeviceDetection';
import { useState } from 'react';

export default function DeviceProvider({ children }) {
  const [deviceInfo, setDeviceInfo] = useState({
    detectedDevice: 'Unknown',
    screenWidth: 0,
    screenHeight: 0,
    ppi: 0,
    deviceType: 'Unknown',
    rawValues: {}
  });

  return (
    <DeviceContext.Provider value={deviceInfo}>
      <DeviceDetect setDeviceInfo={setDeviceInfo} />
      {children}
    </DeviceContext.Provider>
  );
}