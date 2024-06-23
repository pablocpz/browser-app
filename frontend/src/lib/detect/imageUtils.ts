/**
 * Converts an HTMLImageElement to ImageData.
 */
async function convertToImageData(image: HTMLImageElement): Promise<ImageData> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas context");
  }
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}

/**
 * Loads an image from a source URL into an ImageData.
 */
async function loadImage(src: string): Promise<ImageData> {
  console.log("Loading image from source:", src);
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      console.log("Image loaded successfully:", src);
      resolve(img);
    };
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(new Error("Failed to load image from source: " + src));
    };
  });

  return convertToImageData(image);
}

/**
 * Loads an image from a file input into an ImageData.
 */
async function loadImageFromFile(file: File): Promise<ImageData> {
  const url = URL.createObjectURL(file);
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });

  return convertToImageData(image);
}

export { convertToImageData, loadImage, loadImageFromFile };
