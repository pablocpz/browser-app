// src/lib/detect/detection.ts
import {
  getRecognitionsFromAPI as getRecognitionsFromAPI,
} from "./embeddings";
import Criminal from "@/types/criminal";
import DetectedCriminal from "@/types/detectedCriminal";
import { API_BASE_URL } from '@/config';

async function loadCriminalImages(criminalName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/criminal-images/${criminalName}`, {
      mode: 'cors',
      credentials: 'include'
    });
    const data = await response.json();
    if (data.images) {
      console.log(`Images for ${criminalName}:`, data.images);
      return data.images;
    } else {
      console.log(`No images found for ${criminalName}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching images for ${criminalName}:`, error);
    return [];
  }
}

export async function detect(
  imageData: ImageData,
  setProgress: (progress: number) => void,
  confidence_threshold: number,
): Promise<DetectedCriminal[]> {

  const detectedCriminals: DetectedCriminal[] = [];

  console.log("starting detect function...!")
  const results  = await getRecognitionsFromAPI(imageData, setProgress, confidence_threshold);
  const recognitionResults:string[] = results.recognitionResults; // list of strings with the names of the criminals recognized
  const recognitionSimilarities:number[] = results.recognitionSimilarities; // list of floats with the confidence of those criminals

  console.log("got embeddings for the uploaded image!")

  for (let i = 0; i < recognitionResults.length; i++) {
    const criminal = recognitionResults[i];
    const similarity = recognitionSimilarities[i];

    // Skip if the criminal name is an empty string
    if (criminal === " ") {
        console.log("Criminal name is empty, skipping...");
        continue;
    }

    const criminal_images:string[] = await loadCriminalImages(criminal);

    // Given the recognized criminal name, we need to get its database images
    // to store it in the images field of the criminal object
    detectedCriminals.push(
        new DetectedCriminal(new Criminal(criminal, criminal_images), similarity),
    );

    // DetectedCriminal gets a Criminal object and similarity value
  }

  console.log("done!");

  return detectedCriminals;
}
