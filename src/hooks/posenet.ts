import * as posenet from "@tensorflow-models/posenet";

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export const getBoundingBox = (keypoints: posenet.Keypoint[]): BoundingBox => {
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
};
