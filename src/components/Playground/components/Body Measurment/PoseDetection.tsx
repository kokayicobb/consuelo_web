"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { Button } from "@/components/ui/button";

const PoseDetection = () => {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null,
  );
  const [webcamRunning, setWebcamRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numPoses: 2,
      });
      setPoseLandmarker(landmarker);
    };

    createPoseLandmarker();
  }, []);

  const enableWebcam = async () => {
    if (!poseLandmarker) {
      console.log("PoseLandmarker is not initialized yet.");
      return;
    }

    try {
      setWebcamRunning((prev) => !prev);

      if (!videoRef.current) return;

      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", async () => {
        console.log("Webcam started. Setting PoseLandmarker to VIDEO mode...");
        await poseLandmarker.setOptions({ runningMode: "VIDEO" });

        predictWebcam();
      });
    } catch (error) {
      console.error("Error accessing the webcam:", error);
      alert("Could not access the webcam. Please check permissions.");
    }
  };

  const predictWebcam = async () => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return;

    console.log("Starting pose detection...");

    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return; // Early return if context is null

    const drawingUtils = new DrawingUtils(canvasCtx);

    const detect = async () => {
      if (
        !webcamRunning ||
        !videoRef.current ||
        !canvasRef.current ||
        !canvasCtx
      )
        return;

      // Run detection
      poseLandmarker.detectForVideo(
        videoRef.current,
        performance.now(),
        (result) => {
          console.log("Detection Result:", result); // Log the output

          // Clear canvas before drawing
          canvasCtx.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height,
          );

          // Check if landmarks are present
          if (result.landmarks && result.landmarks.length > 0) {
            console.log("Landmarks detected!", result.landmarks);

            for (const landmark of result.landmarks) {
              drawingUtils.drawLandmarks(landmark, {
                radius: (data) =>
                  DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
              });
              drawingUtils.drawConnectors(
                landmark,
                PoseLandmarker.POSE_CONNECTIONS,
              );
            }
          } else {
            console.warn("No landmarks detected.");
          }
        },
      );

      requestAnimationFrame(detect); // Keep running the function
    };

    detect();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-teal-600">
        Pose Detection with MediaPipe
      </h1>
      <Button
        onClick={enableWebcam}
        className="rounded-lg bg-teal-600 px-4 py-2 text-white"
      >
        {webcamRunning ? "Disable Webcam" : "Enable Webcam"}
      </Button>
      <div className="relative mt-4">
        <video
          ref={videoRef}
          className="w-full max-w-3xl"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          width="1280"
          height="720"
        />
      </div>
    </div>
  );
};

export default PoseDetection;
