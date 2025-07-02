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
  validateCategory: (
    bbox: BoundingBox,
    img: HTMLImageElement,
    index: number
  ) => boolean;
}

// Main ImageUpload Component
const ImageUpload: React.FC<ImageUploadProps> = ({
  index,
  label,
  validateCategory,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { loadNet, getBoundingBox } = usePoseNet();
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
        const pose = await net.estimateSinglePose(img, {
          flipHorizontal: false,
        });

        if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
          setMessage("No person detected.");
          return;
        }

        const bbox = getBoundingBox(pose.keypoints);
        const isValid = validateCategory(bbox, img, index);
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
