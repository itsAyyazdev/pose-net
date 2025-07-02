"use client";
import ImageUpload from "@/components/Upload/ImageUpload"; // Adjust path as needed
import { PoseTypes } from "@/types/poseTypes";

export default function Home() {
  const PoseTypesAre = Object.values(PoseTypes);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <section className="flex flex-wrap justify-center gap-8">
        {PoseTypesAre.map((label, index) => (
          <ImageUpload key={index} index={index} label={label} pose={label} />
        ))}
      </section>
    </div>
  );
}
