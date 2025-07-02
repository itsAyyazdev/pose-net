"use client";
import { useState, useCallback } from "react";
import "@tensorflow/tfjs";
import ImagePreview from "../Preview/ImagePreview";
import FileInput from "../Input/FileInput";
import MessageDisplay from "../Message/MessageDisplay";
import Label from "../Label/Label";
import { usePoseNet, validateCategory } from "@/lib/usePoseNet";
import { readFileAsDataURL } from "@/lib/fileUtils";
import { PoseTypes } from "@/types/poseTypes";

interface ImageUploadProps {
  index: number;
  label: string;
  pose: PoseTypes;
}

// Main ImageUpload Component
const ImageUpload: React.FC<ImageUploadProps> = ({ index, label, pose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { loadNet } = usePoseNet();

  // Handle image selection and verification
  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      // Validation logic for categories

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
        const isValid = validateCategory(poseIs.keypoints, pose);
        const newMessage = isValid
          ? "Photo verified!"
          : `Photo may not match: ${label}`;
        setMessage(newMessage);
      };
    },
    [label, loadNet, pose]
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
