"use client";
import ImageUpload from "@/components/Upload/ImageUpload"; // Adjust path as needed

const labels = [
  "Full body",
  "Close up",
  "Half upper body",
  "Close up with shoulder",
];

export default function Home() {
  // Validation logic for categories
  const validateCategory = (
    bbox: { height: number; width: number },
    img: HTMLImageElement,
    index: number
  ) => {
    const relHeight = bbox.height / img.naturalHeight;
    const relWidth = bbox.width / img.naturalWidth;
    if (index === 0) {
      return relHeight > 0.7 && relWidth > 0.2; // Full body
    } else if (index === 1) {
      return relHeight > 0.5 && relWidth > 0.5; // Close up
    } else if (index === 2) {
      return relHeight > 0.3 && relHeight < 0.7 && relWidth > 0.3; // Half upper body
    } else if (index === 3) {
      return relHeight > 0.4 && relWidth > 0.6; // Close up with shoulder
    }
    return false;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <section className="flex flex-row gap-8">
        {labels.map((label, index) => (
          <ImageUpload
            key={index}
            index={index}
            label={label}
            validateCategory={validateCategory}
          />
        ))}
      </section>
    </div>
  );
}
