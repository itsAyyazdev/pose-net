import { useRef, useCallback } from "react";
import * as posenet from "@tensorflow-models/posenet";
import { PoseTypes } from "@/types/poseTypes";

export const usePoseNet = () => {
  const netRef = useRef<posenet.PoseNet | null>(null);

  const loadNet = useCallback(async () => {
    if (!netRef.current) {
      netRef.current = await posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 257, height: 257 },
        multiplier: 0.75,
      });
    }
    return netRef.current;
  }, []);

  return { loadNet };
};

export const validateCategory = (
  keyPoints: posenet.Keypoint[],
  pose: PoseTypes
): boolean => {
  // Helper function to check if a keypoint is detected (score above threshold)
  const isDetected = (part: string, threshold: number = 0.5): boolean => {
    const keypoint = keyPoints.find((kp) => kp.part === part);
    return keypoint ? keypoint.score >= threshold : false;
  };

  // Helper function to get y-coordinate of a keypoint
  const getY = (part: string): number | null => {
    const keypoint = keyPoints.find((kp) => kp.part === part);
    return keypoint ? keypoint.position.y : null;
  };

  // Helper function to get x-coordinate of a keypoint
  // const getX = (part: string): number | null => {
  //   const keypoint = keyPoints.find((kp) => kp.part === part);
  //   return keypoint ? keypoint.position.x : null;
  // };

  // Count detected keypoints
  const detectedCount = keyPoints.filter((kp) => kp.score >= 0.5).length;

  if (detectedCount < 1) {
    return false; // Likely not a human image
  }

  // Get y-coordinates for key body parts
  const noseY = getY("nose");
  const leftHipY = getY("leftHip");
  const rightHipY = getY("rightHip");
  // const leftAnkleY = getY("leftAnkle");
  // const rightAnkleY = getY("rightAnkle");
  const leftShoulderY = getY("leftShoulder");
  const rightShoulderY = getY("rightShoulder");

  // Get x-coordinates for shoulders to check frame coverage
  // const leftShoulderX = getX("leftShoulder");
  // const rightShoulderX = getX("rightShoulder");

  // Check if key y-coordinates are available
  if (
    noseY === null ||
    leftShoulderY === null ||
    rightShoulderY === null ||
    leftHipY === null ||
    rightHipY === null
  ) {
    return pose === "Close up"; // If major keypoints are missing, assume Close up
  }

  // Calculate vertical span (distance from nose to lowest detected point)
  const detectedY = keyPoints
    .filter((kp) => kp.score >= 0.5)
    .map((kp) => kp.position.y);
  const minY = Math.min(...detectedY);
  const maxY = Math.max(...detectedY);
  const verticalSpan = maxY - minY;

  // Determine pose based on detected keypoints and their distribution
  let detectedPose: string;

  if (
    isDetected("leftAnkle") &&
    isDetected("rightAnkle") &&
    isDetected("leftHip") &&
    isDetected("rightHip") &&
    isDetected("leftShoulder") &&
    isDetected("rightShoulder") &&
    verticalSpan > 200 // Ensure significant vertical span for full body
  ) {
    detectedPose = PoseTypes.FullBody;
  } else if (
    isDetected("nose") &&
    isDetected("leftEye") &&
    isDetected("rightEye") &&
    !isDetected("leftHip") &&
    !isDetected("rightHip") &&
    detectedCount <= 3 // Focus on face, few keypoints detected
  ) {
    detectedPose = PoseTypes.CloseUp;
  } else if (
    isDetected("leftShoulder") &&
    isDetected("rightShoulder") &&
    !isDetected("leftHip") &&
    !isDetected("rightHip") &&
    detectedCount > 3 // More keypoints than Close up, but no lower body
  ) {
    detectedPose = PoseTypes.CloseUpWithShoulder;
  } else if (
    isDetected("leftHip") &&
    isDetected("rightHip") &&
    (!isDetected("leftAnkle") || !isDetected("rightAnkle")) &&
    verticalSpan < 200 // Upper body and hips, but not full body
  ) {
    detectedPose = PoseTypes.HalfUpperBody;
  } else {
    detectedPose = PoseTypes.CloseUp; // Default for ambiguous cases
  }

  // Return true if detected pose matches the input pose
  return detectedPose === pose;
};
