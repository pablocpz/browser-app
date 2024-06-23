// // src/detect.ts

// import Criminal from "@/types/criminal";
// import DetectedCriminal from "@/types/detectedCriminal";
// import * as tf from "@tensorflow/tfjs";
// import axios from "axios";

// const THRESHOLD_1 = 0.8; // Threshold for similarity acceptance
// const THRESHOLD_2 = 15.0; // Threshold for standard deviation in pixel positions

// /**
//  * Converts an HTMLImageElement to ImageData.
//  * @param image The HTMLImageElement to convert.
//  * @returns A promise that resolves to the ImageData of the image.
//  */
// async function convertToImageData(image: HTMLImageElement): Promise<ImageData> {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");
//   if (!ctx) {
//     throw new Error("Unable to create canvas context");
//   }
//   canvas.width = image.width;
//   canvas.height = image.height;
//   ctx.drawImage(image, 0, 0);
//   return ctx.getImageData(0, 0, image.width, image.height);
// }

// /**
//  * Fetches embeddings for a given image from a remote API.
//  * @param imageData The ImageData of the image to process.
//  * @param setProgress Function to update the progress of the embedding fetching.
//  * @returns A tensor representing the embeddings of the image.
//  */
// async function getEmbeddingsFromAPI(
//   imageData: ImageData,
//   setProgress: (progress: number) => void,
// ): Promise<tf.Tensor> {
//   const formData = new FormData();
//   const blob = await new Blob([imageData.data.buffer], { type: "image/jpeg" });
//   formData.append("file", blob, "image.jpg");

//   const axiosResponse = await axios.post(
//     "http://localhost:8000/process-image/",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       onUploadProgress: (progressEvent) => {
//         if (progressEvent.total) {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total,
//           );
//           setProgress(progress);
//         }
//       },
//     },
//   );

//   const embeddings = axiosResponse.data.embeddings;
//   return tf.tensor(embeddings);
// }

// /**
//  * Loads an image from a source URL into an ImageData.
//  * @param src The source URL of the image.
//  * @returns A promise that resolves to the loaded ImageData.
//  */
// async function loadImage(src: string): Promise<ImageData> {
//   const image: HTMLImageElement = await new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous"; // Needed if the image is served from a different domain
//     img.src = src;
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//   });

//   return convertToImageData(image);
// }

// /**
//  * Loads an image from a file input into an ImageData.
//  * @param file The file object from an input element of type file.
//  * @returns A promise that resolves to the loaded ImageData.
//  */
// export async function loadImageFromFile(file: File): Promise<ImageData> {
//   const url = URL.createObjectURL(file);
//   const image: HTMLImageElement = await new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => {
//       URL.revokeObjectURL(img.src); // Clean up the URL object
//       resolve(img);
//     };
//     img.onerror = () => {
//       URL.revokeObjectURL(img.src);
//       reject(new Error("Failed to load image"));
//     };
//     img.src = url;
//   });

//   return convertToImageData(image);
// }

// /**
//  * Computes the cosine similarity between two embeddings.
//  * @param embedding1 The first tensor of embeddings.
//  * @param embedding2 The second tensor of embeddings.
//  * @returns The cosine similarity as a number.
//  */
// function computeSimilarity(
//   embedding1: tf.Tensor,
//   embedding2: tf.Tensor,
// ): number {
//   return tf.losses.cosineDistance(embedding1, embedding2, 0).dataSync()[0];
// }

// /**
//  * Calculates the average position (centroid) of a set of pixels.
//  * @param pixels An array of pixel coordinates.
//  * @returns The centroid of the pixels.
//  */
// function averagePosition(pixels: [number, number][]): [number, number] {
//   if (pixels.length === 0) return [0, 0];
//   const xCoords = pixels.map(([x]) => x);
//   const yCoords = pixels.map(([, y]) => y);
//   return [
//     xCoords.reduce((a, b) => a + b, 0) / pixels.length,
//     yCoords.reduce((a, b) => a + b, 0) / pixels.length,
//   ];
// }

// /**
//  * Computes the standard deviation of the distances of pixel positions from their mean position.
//  * @param mean The mean position of the pixels.
//  * @param xs The array of pixel coordinates.
//  * @returns The standard deviation of the positions.
//  */
// function stddev(mean: [number, number], xs: [number, number][]): number {
//   if (xs.length === 0) return 0.0;
//   const [meanX, meanY] = mean;
//   const diffSquareSum = xs.reduce(
//     (sum, [x, y]) => sum + (x - meanX) ** 2 + (y - meanY) ** 2,
//     0,
//   );
//   return Math.sqrt(diffSquareSum / xs.length);
// }

// /**
//  * Processes each criminal image to find matching embeddings.
//  * @param imageEmbeddings The embeddings of the image being analyzed.
//  * @param criminalImageData The ImageData of the criminal's image.
//  * @param setProgress Function to update the progress of detection.
//  * @returns An object containing pixel positions and similarities.
//  */
// async function processCriminalImage(
//   imageEmbeddings: tf.Tensor,
//   criminalImageData: ImageData,
//   setProgress: (progress: number) => void,
// ): Promise<{ pixelPositions: [number, number][]; similarities: number[] }> {
//   const classEmbeddings = await getEmbeddingsFromAPI(
//     criminalImageData,
//     setProgress,
//   );
//   let pixelPositions: [number, number][] = [];
//   let similarities: number[] = [];

//   const embedding_width: number = 64;
//   const embedding_height: number = 64;

//   for (let i = 0; i < Math.min(criminalImageData.width, embedding_width); i++) {
//     for (
//       let j = 0;
//       j < Math.min(criminalImageData.height, embedding_height);
//       j++
//     ) {
//       const embedding1 = imageEmbeddings.slice(
//         [0, i, j, 0],
//         [1, 1, 1, imageEmbeddings.shape[3]!],
//       );

//       const embedding2 = classEmbeddings.slice(
//         [0, i, j, 0],
//         [1, 1, 1, classEmbeddings.shape[3]!],
//       );

//       const similarity = computeSimilarity(embedding1, embedding2);
//       if (similarity > THRESHOLD_1) {
//         similarities.push(similarity);
//         pixelPositions.push([i, j]);
//       }
//     }
//   }

//   return { pixelPositions, similarities };
// }

// /**
//  * Detects criminals in an image by comparing it against known criminal images using deep learning embeddings.
//  * @param imageData The ImageData of the image to analyze.
//  * @param criminals An array of criminal data including images.
//  * @param setProgress Function to update the progress of detection.
//  * @returns A promise that resolves to an array of detected criminals with associated data.
//  */
// export async function detect(
//   imageData: ImageData,
//   criminals: Criminal[],
//   setProgress: (progress: number) => void,
// ): Promise<DetectedCriminal[]> {
//   const detectedCriminals: DetectedCriminal[] = [];
//   const imageEmbeddings = await getEmbeddingsFromAPI(imageData, setProgress);

//   for (const [index, criminal] of criminals.entries()) {
//     console.log("entry", criminal.name);
//     setProgress(Math.round(((index + 1) / criminals.length) * 100));

//     let matched = false;
//     let criminalCentroid: [number, number] | null = null;
//     let criminalStdDev = THRESHOLD_2;
//     let lastPixelPositions: [number, number][] = [];
//     let lastSimilarities: number[] = [];

//     for (const criminalImagePath of criminal.imagePaths) {
//       const criminalImageData = await loadImage(criminalImagePath);
//       const { pixelPositions, similarities } = await processCriminalImage(
//         imageEmbeddings,
//         criminalImageData,
//         setProgress,
//       );

//       if (pixelPositions.length === 0) continue;

//       const centroid = averagePosition(pixelPositions);
//       if (!centroid) continue;
//       const stdDev =
//         stddev(centroid, pixelPositions) / Math.sqrt(pixelPositions.length);

//       if (stdDev < criminalStdDev) {
//         matched = true;
//         criminalCentroid = centroid;
//         criminalStdDev = stdDev;
//         lastPixelPositions = pixelPositions;
//         lastSimilarities = similarities;
//       }
//     }

//     if (!matched) continue;

//     if (criminalCentroid !== null) {
//       const maskData = new ImageData(imageData.width, imageData.height);
//       for (const [x, y] of lastPixelPositions) {
//         const index = (y * imageData.width + x) * 4;
//         maskData.data[index] = 255; // Red
//         maskData.data[index + 1] = 255; // Green
//         maskData.data[index + 2] = 255; // Blue
//         maskData.data[index + 3] = 255; // Alpha (opacity)
//       }

//       const similarity = Math.max(...lastSimilarities);
//       detectedCriminals.push(
//         new DetectedCriminal(criminal, maskData, similarity),
//       );
//     }
//   }
//   console.log("done!");

//   return detectedCriminals;
// }
