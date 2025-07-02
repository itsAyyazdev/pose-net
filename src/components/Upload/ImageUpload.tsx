"use client";

import { useState, useCallback } from "react";
import "@tensorflow/tfjs";
import ImagePreview from "../Preview/ImagePreview";
import FileInput from "../Input/FileInput";
import MessageDisplay from "../Message/MessageDisplay";
import Label from "../Label/Label";
import { usePoseNet } from "@/lib/usePoseNet";
import { readFileAsDataURL } from "@/lib/fileUtils";

// Define interfaces
interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

interface ImageUploadProps {
  index: number;
  label: string;
  pose: string;
}

// Main ImageUpload Component
const ImageUpload: React.FC<ImageUploadProps> = ({ index, label, pose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { loadNet, getBoundingBox } = usePoseNet();

  // Validation logic for categories
  const validateCategory = (
    bbox: BoundingBox,
    img: HTMLImageElement,
    index: string
  ) => {
    const relHeight = bbox.height / img.naturalHeight;
    const relWidth = bbox.width / img.naturalWidth;
    if (index === "Full body") {
      return relHeight > 0.7 && relWidth > 0.2; // Full body
    } else if (index === "Close up") {
      return relHeight > 0.5 && relWidth > 0.5; // Close up
    } else if (index === "Half upper body") {
      return relHeight > 0.3 && relHeight < 0.7 && relWidth > 0.3; // Half upper body
    } else if (index === "Close up with shoulder") {
      return relHeight > 0.4 && relWidth > 0.6; // Close up with shoulder
    }
    return false;
  };
  // Handle image selection and verification
  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const imgSrc = await readFileAsDataURL(file);
      setImage(imgSrc);
      setMessage("Verifying...");

      const img = new window.Image();
      img.src = imgSrc;
      img.onload = async () => {
        const net = await loadNet();
        const poseIs = await net.estimateSinglePose(img, {
          flipHorizontal: false,
        });

        if (!poseIs || !poseIs.keypoints || poseIs.keypoints.length === 0) {
          setMessage("No person detected.");
          return;
        }

        const bbox = getBoundingBox(poseIs.keypoints);
        const isValid = validateCategory(bbox, img, pose);
        const newMessage = isValid
          ? "Photo verified!"
          : `Photo may not match: ${label}`;
        setMessage(newMessage);
      };
    },
    [index, label, validateCategory, loadNet, getBoundingBox]
  );

  return (
    <div className="flex flex-col">
      <Label text={label} />
      <ImagePreview image={image} label={label} />
      <FileInput index={index} onChange={handleImageChange} />
      <MessageDisplay message={message} />
    </div>
  );
};

export default ImageUpload;
