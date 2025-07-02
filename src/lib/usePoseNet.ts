import { useRef, useCallback } from "react";
import * as posenet from "@tensorflow-models/posenet";
import { getBoundingBox } from "../hooks/posenet";

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

  return { loadNet, getBoundingBox };
};
