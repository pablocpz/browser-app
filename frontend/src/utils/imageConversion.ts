export const urlToImageData = async (url: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Use this if the image is served from a different domain
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      } catch (error) {
        reject(new Error("Error converting image to ImageData: " + (error as Error).message));
      }
    };
    img.onerror = (error) => {
      const errorMessage = (error as ErrorEvent).message || "Unknown error";
      reject(new Error("Error loading image: " + errorMessage));
    };
    img.src = url;
    console.log("Loading image from URL:", url);
  });
};
export const imageDataToUrl = (imageData: ImageData) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};
