"use client";

import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
let FaceLandmarker: any, FilesetResolver: any, DrawingUtils: any;
import { Camera, Loader2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Check, Sun, Smile, ArrowUpCircle, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";

// Key landmarks for head measurement
const HEAD_LANDMARKS = {
  temple_right: 162,
  temple_left: 389,
  above_ear_right: 234,
  above_ear_left: 454,
  forehead_mid: 10,
  right_eye: 33, // Added for position feedback
  left_eye: 263, // Added for position feedback
  chin: 152, // Added for position feedback
  nose_tip: 1, // Added for position feedback
};

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [measurements, setMeasurements] = useState<any>(null);
  const [positionFeedback, setPositionFeedback] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState(null);
  const [userGender, setUserGender] = useState("male"); // default to male
  const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");
  const lastVideoTimeRef = useRef<number>(-1);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCollectingMeasurements, setIsCollectingMeasurements] =
    useState(false);
  const hasAutoTriggered = useRef(false);
  const [finalAverage, setFinalAverage] = useState<string | null>(null);
  const measurementsArrayRef = useRef<number[]>([]);
  const collectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraInitializedRef = useRef(false);
  const [showResults, setShowResults] = useState(false);
  const [measurementStage, setMeasurementStage] = useState("initial"); // "initial", "collecting", "complete"
  const startMeasurementCollection = () => {
    setIsCollectingMeasurements(true);
    measurementsArrayRef.current = [];
    setFinalAverage(null);

    collectionTimerRef.current = setTimeout(() => {
      setIsCollectingMeasurements(false);
      if (measurementsArrayRef.current.length > 0) {
      }
    }, 300000);
  };

  // Add cleanup for the timer
  useEffect(() => {
    return () => {
      if (collectionTimerRef.current) {
        clearTimeout(collectionTimerRef.current);
      }
    };
  }, []);
  const calculateHeadMeasurements = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    const points = landmarks[0];
    const getPoint = (index) => points[index] || null;

    // Fetch key landmark points
    const templeRight = getPoint(HEAD_LANDMARKS.temple_right);
    const templeLeft = getPoint(HEAD_LANDMARKS.temple_left);
    const foreheadPoint = getPoint(HEAD_LANDMARKS.forehead_mid);
    const rightEarPoint = getPoint(HEAD_LANDMARKS.above_ear_right);
    const leftEarPoint = getPoint(HEAD_LANDMARKS.above_ear_left);

    if (
      !templeRight ||
      !templeLeft ||
      !foreheadPoint ||
      !rightEarPoint ||
      !leftEarPoint
    ) {
      console.error("Invalid landmarks: Missing critical points.");
      return null;
    }

    // Calculate temple-to-temple width
    const templeWidth = Math.hypot(
      templeRight.x - templeLeft.x,
      templeRight.y - templeLeft.y,
      templeRight.z - templeLeft.z,
    );

    // Calculate average depth of face
    const avgEarZ = (rightEarPoint.z + leftEarPoint.z) / 2;
    const faceDepth = Math.abs(foreheadPoint.z - avgEarZ);

    // Estimate back-of-head depth
    const estimatedBackDepth = faceDepth * 2.4;

    // Compute radii for circumference
    const widthRadius = templeWidth / 2;
    const depthRadius = estimatedBackDepth / 2;

    // Elliptical circumference using Ramanujan's approximation
    const h = Math.pow(
      (widthRadius - depthRadius) / (widthRadius + depthRadius),
      2,
    );
    const circumference =
      Math.PI *
      (widthRadius + depthRadius) *
      (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

    // Dynamic pixel-to-cm conversion factor
    const PIXEL_TO_CM = dynamicPixelToCm(templeWidth, landmarks);
    const CALIBRATION_FACTOR = userGender === "male" ? 1.85 : 1.75; // Adjust calibration based on gender

    // Final measurements
    return {
      templeWidth: (templeWidth * PIXEL_TO_CM * CALIBRATION_FACTOR).toFixed(1),
      faceDepth: (faceDepth * PIXEL_TO_CM * CALIBRATION_FACTOR).toFixed(1),
      estimatedCircumference: (
        circumference *
        PIXEL_TO_CM *
        CALIBRATION_FACTOR
      ).toFixed(1),
    };
  };
  const getPositionFeedback = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return [];

    const feedback = [];
    const points = landmarks[0];

    // Check head tilt (using eyes)
    const rightEye = points[HEAD_LANDMARKS.right_eye];
    const leftEye = points[HEAD_LANDMARKS.left_eye];
    const eyeTiltDegrees = Math.abs(
      Math.atan2(leftEye.y - rightEye.y, leftEye.x - rightEye.x) *
        (180 / Math.PI),
    );

    if (eyeTiltDegrees > 10) {
      feedback.push(eyeTiltDegrees > 0 ? "Look Straight" : "Look Straight");
    }

    // Check if looking straight ahead (using nose and eyes)
    const noseTip = points[HEAD_LANDMARKS.nose_tip];
    const eyeMidpointX = (rightEye.x + leftEye.x) / 2;
    const horizontalOffset = Math.abs(noseTip.x - eyeMidpointX);

    if (horizontalOffset > 0.03) {
      feedback.push(
        noseTip.x < eyeMidpointX
          ? "← Look more to your left"
          : "→ Look more to your right",
      );
    }

    // Check jaw position
    // Simple check for mobile
    const isMobile = window.innerWidth < 768;

    // Check distance from camera
    const templeRight = points[HEAD_LANDMARKS.temple_right];
    const templeLeft = points[HEAD_LANDMARKS.temple_left];
    const faceWidth = Math.hypot(
      templeRight.x - templeLeft.x,
      templeRight.y - templeLeft.y,
    );

    // Different thresholds based on device type
    if (isMobile) {
      if (faceWidth < 0.34) {
        feedback.push("👤 Move closer to the camera");
      } else if (faceWidth > 0.35) {
        feedback.push("👤 Move further from the camera");
      }
    } else {
      // Desktop/tablet thresholds
      if (faceWidth < 0.28) {
        feedback.push("👤 Move closer to the camera");
      } else if (faceWidth > 0.29) {
        feedback.push("👤 Move further from the camera");
      }
    }
    // Check jaw position
    const chin = points[HEAD_LANDMARKS.chin];
    const forehead = points[HEAD_LANDMARKS.forehead_mid];
    const jawAngle =
      Math.atan2(chin.y - forehead.y, chin.z - forehead.z) * (180 / Math.PI);

    if (isMobile) {
      // Mobile thresholds
      if (jawAngle > 83.5) {
        feedback.push("↓ Lower your chin slightly");
      } else if (jawAngle < 82.0) {
        feedback.push("↑ Raise your chin slightly");
      }
    } else {
      // Desktop thresholds - slightly more lenient
      if (jawAngle > 83.5) {
        feedback.push("↓ Lower your chin slightly");
      } else if (jawAngle < 82.0) {
        feedback.push("↑ Raise your chin slightly");
      }
    }
    return feedback;
  };

  const calculateCalibrationFactor = (landmarks, gender = "male") => {
    if (!landmarks || landmarks.length === 0) return null;

    const points = landmarks[0];

    const getDistance = (point1, point2) => {
      return Math.hypot(
        point1.x - point2.x,
        point1.y - point2.y,
        point1.z - point2.z,
      );
    };

    // Known average facial proportions (in cm)
    const AVERAGE_PROPORTIONS = {
      male: {
        INTERPUPILLARY: 6.5, // Male average
        BITEMPORAL: 15.0, // Male average
        EYE_TO_CHIN: 12.0, // Male average
        NOSE_LENGTH: 5.2, // Male average
      },
      female: {
        INTERPUPILLARY: 6.2, // Female average
        BITEMPORAL: 13.0, // Female average
        EYE_TO_CHIN: 11.0, // Female average
        NOSE_LENGTH: 4.8, // Female average
      },
    };

    // Extract relevant facial points
    const leftEye = points[33]; // Left eye center
    const rightEye = points[263]; // Right eye center
    const chin = points[152]; // Chin point
    const noseTip = points[1]; // Nose tip
    const noseBottom = points[2]; // Nose bottom
    const templeRight = points[162];
    const templeLeft = points[389];

    // Calculate actual distances in pixel space
    const interpupillaryDist = getDistance(leftEye, rightEye);
    const bitemporalDist = getDistance(templeRight, templeLeft);
    const eyeToChinDist = getDistance(leftEye, chin);
    const noseLength = getDistance(noseTip, noseBottom);

    // Use gender-specific proportions
    const proportions = AVERAGE_PROPORTIONS[gender];

    // Rest of the calculation using proportions...
    const scales = [
      proportions.INTERPUPILLARY / interpupillaryDist,
      proportions.BITEMPORAL / bitemporalDist,
      proportions.EYE_TO_CHIN / eyeToChinDist,
      proportions.NOSE_LENGTH / noseLength,
    ];

    // Remove outliers (values that are too far from median)
    const median = scales.sort((a, b) => a - b)[Math.floor(scales.length / 2)];
    const validScales = scales.filter(
      (scale) => Math.abs(scale - median) / median < 0.3,
    );

    // Calculate final scaling factor as weighted average
    const weights = [0.3, 0.3, 0.2, 0.2]; // Higher weight to more reliable measurements
    const finalScale =
      validScales.reduce((sum, scale, i) => sum + scale * weights[i], 0) /
      weights.reduce((sum, weight) => sum + weight, 0);

    // Apply a small correction factor based on head tilt
    const tiltAngle = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x,
    );
    const tiltCorrection = 1 + Math.abs(tiltAngle) * 0.1; // Up to 10% correction for tilt

    return finalScale * tiltCorrection;
  };

  const dynamicPixelToCm = (templeWidth, landmarks) => {
    const calibrationFactor = calculateCalibrationFactor(landmarks);
    if (!calibrationFactor) return 16.0 / templeWidth; // Fallback to original method

    return calibrationFactor;
  };
  const drawBlendShapes = (el: HTMLElement, blendShapes: any[]) => {
    if (!blendShapes.length) return;

    let htmlMaker = "";
    blendShapes[0].categories.map((shape: any) => {
      htmlMaker += `
        <li class="blend-shapes-item">
          <span class="blend-shapes-label">${
            shape.displayName || shape.categoryName
          }</span>
          <span class="blend-shapes-value" style="width: calc(${
            +shape.score * 100
          }% - 120px)">
            ${(+shape.score).toFixed(4)}
          </span>
        </li>
      `;
    });

    el.innerHTML = htmlMaker;
  };

  const enableCam = useCallback(async () => {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }
    if (!webcamRunning) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 },
          advanced: [{ width: 720, height: 720 }],
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        cameraInitializedRef.current = true;
        predictWebcam();
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setWebcamRunning(false);
    }
  }, [faceLandmarker, webcamRunning, setWebcamRunning]); // Add dependencies used in the function
  useEffect(() => {
    const initializeVision = async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision");

        FaceLandmarker = vision.FaceLandmarker;
        FilesetResolver = vision.FilesetResolver;
        DrawingUtils = vision.DrawingUtils;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
        );

        const landmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
          },
        );

        setFaceLandmarker(landmarker);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing vision:", error);
        setIsLoading(false);
      }
    };

    initializeVision();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (webcamRunning && videoRef.current && !videoRef.current.srcObject) {
      enableCam();
    }
  }, [enableCam, webcamRunning]);

  const drawHeadCircle = (canvasCtx, landmarks, canvas) => {
    // Get relevant landmarks
    const foreheadMid = landmarks[HEAD_LANDMARKS.forehead_mid];
    const templeRight = landmarks[HEAD_LANDMARKS.temple_right];
    const templeLeft = landmarks[HEAD_LANDMARKS.temple_left];
    const chin = landmarks[HEAD_LANDMARKS.chin];

    // Calculate vertical center between forehead and chin
    const centerY = ((foreheadMid.y + chin.y) / 2) * canvas.height;
    const centerX = ((templeLeft.x + templeRight.x) / 2) * canvas.width;

    // Calculate distance for better head coverage
    const templeWidth = Math.sqrt(
      Math.pow((templeLeft.x - templeRight.x) * canvas.width, 2) +
        Math.pow((templeLeft.y - templeRight.y) * canvas.height, 2),
    );

    // Make circle larger to encompass whole head
    const radius = templeWidth * 0.85;

    // Create gradient for a more delightful appearance
    const gradient = canvasCtx.createLinearGradient(
      centerX - radius,
      centerY,
      centerX + radius,
      centerY,
    );
    gradient.addColorStop(0, "rgba(125, 211, 252, 0.8)");
    gradient.addColorStop(1, "rgba(147, 197, 253, 0.8)");

    // Draw main circle with gradient
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = gradient;
    canvasCtx.lineWidth = 4;
    canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    canvasCtx.stroke();

    // Add subtle glow effect
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = "rgba(147, 197, 253, 0.2)";
    canvasCtx.lineWidth = 8;
    canvasCtx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    canvasCtx.stroke();
  };

  const predictWebcam = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !faceLandmarker ||
      !DrawingUtils
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const drawingUtils = new DrawingUtils(canvasCtx);

    // Get the container width (parent element or viewport)
    const containerWidth = Math.min(window.innerWidth - 32, 480);
    const ratio = video.videoHeight / video.videoWidth;

    // Set display dimensions
    video.style.width = `${containerWidth}px`;
    video.style.height = `${containerWidth * ratio}px`;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth * ratio}px`;

    // Set actual canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear and setup canvas context
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the video frame
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let startTimeMs = performance.now();
    let results;

    try {
      results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results?.faceLandmarks) {
        const newMeasurements = calculateHeadMeasurements(
          results.faceLandmarks,
        );
        setMeasurements(newMeasurements);

        if (isCollectingMeasurements && newMeasurements) {
          measurementsArrayRef.current.push(
            parseFloat(newMeasurements.estimatedCircumference),
          );
        }

        // Auto-capture logic with position check
        const feedback = getPositionFeedback(results.faceLandmarks);
        setPositionFeedback(feedback);

        // Auto-capture logic with validation checks
        if (
          feedback.length === 0 && // No positioning issues
          !isCollectingMeasurements && // Not already collecting
          !hasAutoTriggered.current && // Haven't triggered yet
          cameraInitializedRef.current && // Camera is initialized
          results.faceLandmarks?.length > 0 && // We have valid face landmarks
          newMeasurements?.estimatedCircumference // We have valid measurements
        ) {
          setTimeout(() => {
            // Recheck all conditions after delay
            if (
              feedback.length === 0 &&
              results.faceLandmarks?.length > 0 &&
              newMeasurements?.estimatedCircumference
            ) {
              hasAutoTriggered.current = true;
              startMeasurementCollection();
            }
          }, 1550);
        } else if (feedback.length > 0) {
          hasAutoTriggered.current = false;
        }

        // Clear and redraw canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks.length > 0) {
          drawHeadCircle(canvasCtx, results.faceLandmarks[0], canvas);
        }
      }
    } catch (error) {
      console.error("Error detecting faces:", error);
      return;
    }

    if (results?.faceLandmarks) {
      // Clear the canvas first
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the video frame
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Only draw for the first detected face
      if (results.faceLandmarks.length > 0) {
        drawHeadCircle(canvasCtx, results.faceLandmarks[0], canvas);
      }
    }

    const videoBlendShapes = document.getElementById("video-blend-shapes");
    if (videoBlendShapes && results?.faceBlendshapes) {
      drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
    }

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const WelcomeScreen = ({ onEnableCamera }) => {
    return (
      <div className="flex h-full flex-col justify-between bg-white text-black">
        <div className="space-y-1 text-center">
          <div className="inline-flex rounded-full bg-blue-100">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-xl">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text font-bold text-transparent">
              Consuelo
            </span>
            <span className="font-bold"> Fit Calculator</span>
          </h1>
          <p className="text-xs text-gray-600">AI-powered precision fitting</p>
        </div>

        <div className="flex h-full flex-col justify-between bg-white p-5 text-black">
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-5 text-center">
              <h2 className="text-sm font-medium text-blue-900">
                Let's Get the Perfect Shot!
              </h2>
              <p className="text-xl text-blue-800">
                Hold your device at eye level or slightly above
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-5">
              <h2 className="mb-3 text-sm font-medium text-blue-900">
                Select your gender for more accurate measurements:
              </h2>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setSelectedGender("male")}
                  className={`rounded-lg px-4 py-2 ${
                    selectedGender === "male"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500"
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setSelectedGender("female")}
                  className={`rounded-lg px-4 py-2 ${
                    selectedGender === "female"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="rounded-lg bg-gray-50 p-5 text-xs">
          <h3 className="mb-1 font-semibold text-gray-800">
            Before You Begin:
          </h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {[
              "Remove headwear",
              "Hair out of face",
              "Face fully visible",
              "Good lighting",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-600"
              >
                <Check className="h-3 w-3 flex-shrink-0 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div> */}

        <Button
          onClick={() => onEnableCamera(selectedGender)}
          disabled={!selectedGender}
          className="mt-4 flex w-full items-center justify-center text-sm sm:w-auto sm:text-base"
          size="default"
        >
          <Camera className="mr-2 h-4 w-4" />
          Enable Camera
        </Button>
      </div>
    );
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="h-[60vh] w-full overflow-hidden rounded-3xl bg-white">
      <div className="flex h-full flex-col p-4">
        {isCollectingMeasurements ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 md:h-16 md:w-16" />
              <div className="text-center text-2xl font-bold text-black md:text-4xl">
                Your Head Measurements
              </div>
            </div>

            <div className="w-full max-w-md rounded-xl bg-gray-100 p-4 shadow-2xl md:p-6">
              <div className="space-y-3">
                {/* <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                  <span className="text-sm font-medium text-black md:text-base">
                    Temple Width
                  </span>
                  <span className="font-bold text-black">
                    {measurements?.templeWidth} cm
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                  <span className="text-sm font-medium text-black md:text-base">
                    Face Depth
                  </span>
                  <span className="font-bold text-black">
                    {measurements?.faceDepth} cm
                  </span>
                </div> */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                  <span className="text-sm font-medium text-black md:text-base">
                    Head Circumference
                  </span>
                  <span className="font-bold text-black">
                    {measurements?.estimatedCircumference
                      ? measurements.estimatedCircumference
                      : null}{" "}
                    cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!webcamRunning ? (
              <WelcomeScreen
                onEnableCamera={(gender) => {
                  setUserGender(gender);
                  setWebcamRunning(true);
                }}
              />
            ) : (
              // Active webcam state

              <div className="flex h-full w-full flex-col bg-white p-4">
                <div className="flex flex-grow flex-col">
                  <div className="relative mb-4 flex-grow">
                    <div className="absolute inset-0 overflow-hidden rounded-xl shadow-2xl">
                      <video
                        ref={videoRef}
                        className="absolute left-0 top-0 h-full w-full -scale-x-100 transform object-cover"
                        autoPlay
                        playsInline
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute left-0 top-0 h-full w-full -scale-x-100 transform"
                      />
                    </div>

                    {/* Overlay for position feedback */}
                    <div className="absolute left-4 right-4 top-4 flex flex-col items-start space-y-2">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: positionFeedback.includes("Look Straight")
                            ? 1
                            : 0,
                        }}
                        className="rounded-lg bg-blue-500/80 p-2 text-sm text-white shadow-lg"
                      >
                        Look Straight
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: positionFeedback.some((f) =>
                            f.includes("Look more to"),
                          )
                            ? 1
                            : 0,
                        }}
                        className="rounded-lg bg-blue-500/80 p-2 text-sm text-white shadow-lg"
                      >
                        {positionFeedback.find((f) =>
                          f.includes("Look more to"),
                        ) || ""}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: positionFeedback.some((f) =>
                            f.includes("chin"),
                          )
                            ? 1
                            : 0,
                        }}
                        className="rounded-lg bg-blue-500/80 p-2 text-sm text-white shadow-lg"
                      >
                        {positionFeedback.find((f) => f.includes("chin")) || ""}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: positionFeedback.some((f) =>
                            f.includes("Move"),
                          )
                            ? 1
                            : 0,
                        }}
                        className="rounded-lg bg-blue-500/80 p-2 text-sm text-white shadow-lg"
                      >
                        {positionFeedback.find((f) => f.includes("Move")) || ""}
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col items-center">
                    <div className="flex w-full justify-center">
                      <div className="flex transform items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-sm text-gray-600">
                        <Camera className="h-4 w-4" />
                        Scanning will begin automatically
                      </div>
                    </div>
                    <span className="mt-2 text-xs text-gray-500">
                      * Hold still when positioning instructions disappear
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div />
          </>
        )}
      </div>
    </div>
  );
}
