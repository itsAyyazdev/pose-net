"use client";
import ImageUpload from "@/components/Upload/ImageUpload"; // Adjust path as needed

const labels = [
  "Full body",
  "Close up",
  "Half upper body",
  "Close up with shoulder",
];

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <section className="flex flex-wrap justify-center gap-8">
        {labels.map((label, index) => (
          <ImageUpload key={index} index={index} label={label} pose={label} />
        ))}
      </section>
    </div>
  );
}
