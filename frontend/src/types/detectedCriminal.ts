import Criminal from "@/types/criminal";

export default class DetectedCriminal {
  constructor(
    public criminal: Criminal,
    // public mask: ImageData,
    public similarity: number,
  ) {}

  // get meanLocation(): [number, number] {
  //   let sumX = 0,
  //     sumY = 0,
  //     count = 0;
    // const width = this.mask.width;
    // const height = this.mask.height;
    // const imageData = this.mask;

  //   for (let y = 0; y < height; y++) {
  //     for (let x = 0; x < width; x++) {
  //       const index = (y * width + x) * 4; // index of the red channel in the RGBA data
  //       if (imageData.data[index] > 0) {
  //         // assuming mask is binary (0 or 255)
  //         sumX += x;
  //         sumY += y;
  //         count++;
  //       }
  //     }
  //   }

  //   if (count === 0) return [0, 0]; // to avoid division by zero if mask is empty

  //   const meanX = sumX / count;
  //   const meanY = sumY / count;
  //   return [meanX, meanY];
  // }

  get similarityScore(): number {
    return this.similarity;
  }
}
