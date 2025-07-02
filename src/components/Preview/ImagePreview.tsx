import Image from "next/image";
import React from "react";

interface ImagePreviewProps {
  image: string | null;
  label: string;
}
// ImagePreview Component
const ImagePreview: React.FC<ImagePreviewProps> = ({ image, label }) => (
  <div className="w-48 h-48 border-2 flex items-center justify-center bg-white/60 relative overflow-hidden shadow-md">
    {image ? (
      <Image
        src={image}
        alt={`Selected ${label}`}
        className="object-contain w-full h-full"
        loader={() => image} // WARNING: this bypasses optimization
        unoptimized
        width={500}
        height={500}
      />
    ) : (
      <span className="text-gray-500">No image selected</span>
    )}
  </div>
);

export default ImagePreview;
