import axios from "axios";

// const THRESHOLD_1 = 0.8; // Threshold for similarity acceptance

/**
 * Fetches embeddings for a given image from a remote API.
 */
export async function getRecognitionsFromAPI(
  imageData: ImageData,
  setProgress: (progress: number) => void,
  confidence_threshold: number,
): Promise<{ recognitionResults: string[], recognitionSimilarities: number[] }> {

  const formData = new FormData();
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');


  console.log("inside getEmbeddingsFromAPI()")
  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }
  ctx.putImageData(imageData, 0, 0);
  console.log("ImageData put on canvas");

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create Blob from ImageData"));
      }
    }, 'image/jpeg');
  });

  if (!blob) {
    throw new Error("Failed to create Blob from ImageData");
  }

  formData.append("file", blob, "image.jpg");

  try {
    const axiosResponse = await axios.post(
      "http://localhost:8000/process-image/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          confidence_threshold: confidence_threshold,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(progress);
          }
        },
      },
    );

    const recognitionResults = axiosResponse.data.recognition;
    const recognitionSimilarities = axiosResponse.data.similarities;
    console.log("Recognition inference done from API");

    return { recognitionResults, recognitionSimilarities };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error in getRecognitionsFromAPI:", error.response.data);
    } else {
      console.error("Error in getRecognitionsFromAPI:", error);
    }
    throw error;
  }
}

// /**
//  * Computes the cosine similarity between two embeddings.
//  */
// function computeSimilarity(
//   embedding1: tf.Tensor,
//   embedding2: tf.Tensor,
// ): number {
//   return tf.losses.cosineDistance(embedding1, embedding2, 0).dataSync()[0];
// }

// export { getRecognitionsFromAPI as getEmbeddingsFromAPI, computeSimilarity, THRESHOLD_1 };