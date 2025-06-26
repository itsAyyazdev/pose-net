"use client";
import { useState, useRef } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";

const labels = [
  "Full body",
  "Close up",
  "half upper body",
  "Close up with shoulder"
];

export default function Home() {
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [messages, setMessages] = useState<string[]>(["", "", "", ""]);
  const netRef = useRef<posenet.PoseNet | null>(null);

  // Load the PoseNet model only once
  async function loadNet() {
    if (!netRef.current) {
      netRef.current = await posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 257, height: 257 },
        multiplier: 0.75
      });
    }
    return netRef.current;
  }

  // Helper: get bounding box from keypoints
  function getBoundingBox(keypoints: posenet.Keypoint[]) {
    const valid = keypoints.filter((k) => k.score && k.score > 0.3);
    const xs = valid.map((k) => k.position.x);
    const ys = valid.map((k) => k.position.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }

  // Basic logic to estimate category
  function estimateCategory(bbox: any, img: HTMLImageElement, idx: number) {
    const relHeight = bbox.height / img.naturalHeight;
    const relWidth = bbox.width / img.naturalWidth;
    // Heuristic rules (can be improved)
    if (idx === 0) {
      // Full body: bounding box covers most of image height
      return relHeight > 0.7 && relWidth > 0.2;
    } else if (idx === 1) {
      // Close up: bounding box covers most of image width and height
      return relHeight > 0.5 && relWidth > 0.5;
    } else if (idx === 2) {
      // Half upper body: bounding box covers upper half of image
      return relHeight > 0.3 && relHeight < 0.7 && relWidth > 0.3;
    } else if (idx === 3) {
      // Close up with shoulder: similar to close up but width is larger (shoulders visible)
      return relHeight > 0.4 && relWidth > 0.6;
    }
    return false;
  }

  const handleImageChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target?.result as string;
        const newImages = [...images];
        newImages[index] = imgSrc;
        setImages(newImages);
        setMessages((msgs) => {
          const newMsgs = [...msgs];
          newMsgs[index] = "Verifying...";
          return newMsgs;
        });
        // Create an image element for pose detection
        const img = new window.Image();
        img.src = imgSrc;
        img.onload = async () => {
          const net = await loadNet();
          const pose = await net.estimateSinglePose(img, {
            flipHorizontal: false
          });
          if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
            setMessages((msgs) => {
              const newMsgs = [...msgs];
              newMsgs[index] = "No person detected.";
              return newMsgs;
            });
            return;
          }
          const bbox = getBoundingBox(pose.keypoints);
          const isValid = estimateCategory(bbox, img, index);
          setMessages((msgs) => {
            const newMsgs = [...msgs];
            newMsgs[index] = isValid ? "Photo verified!" : `Photo may not match: ${labels[index]}`;
            return newMsgs;
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <section className="flex flex-row gap-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <label
              className="w-48 h-48 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-white/60 relative overflow-hidden shadow-md"
            >
              {images[i] ? (
                <img src={images[i] as string} alt={`Selected ${i + 1}`} className="object-contain w-full h-full" />
              ) : (
                <span className="text-gray-500">Click to pick image</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageChange(i, e)}
              />
            </label>
            <span className="mt-2 text-center text-base font-medium text-gray-700">{labels[i]}</span>
            <span className="mt-1 text-xs text-gray-500 min-h-[20px]">{messages[i]}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
