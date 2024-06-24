import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DetectedCriminal from "@/types/detectedCriminal";
import Criminal from "@/types/criminal";
import { detect } from "@/lib/detect/detection";
import { urlToImageData } from "../../utils/imageConversion";
import ProgressBar from "@/components/ProgressBar";
import "./Home.css";
import { API_BASE_URL } from '@/config';
import axios from 'axios';

const Home = () => {
  const [detectedObjects, setDetectedObjects] = useState<DetectedCriminal[]>([]);
  const [uploadedImageData, setUploadedImageData] = useState<ImageData | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log("Fetching images from:", `${API_BASE_URL}/get-images/`);
        const response = await fetch(`${API_BASE_URL}/get-images/`, {
          mode: 'cors',
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.images) {
          setImages(data.images);
        } else {
          setError("Failed to load images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setError(`Error fetching images: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const loadCriminals = async () => {
      try {
        console.log("Fetching criminals from:", `${API_BASE_URL}/list-criminals/`);
        const response = await axios.get(`${API_BASE_URL}/list-criminals/`, {
          withCredentials: true
        });
        console.log("Loaded criminals:", response.data);
        setCriminals(response.data);
      } catch (error) {
        console.error("Error loading criminals:", error);
        setError(`Error loading criminals: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    loadCriminals();
  }, []);

  useEffect(() => {
    const loadAndDetect = async () => {
      if (criminals.length > 0 && uploadedImageData) {
        setLoading(true);
        setProgress(0);

        try {
          console.log("loading and detecting");
          const detected_criminals: DetectedCriminal[] = await detect(
            uploadedImageData,
            setProgress,
            confidenceThreshold
          );
          console.log("detected criminals", detected_criminals);

          setDetectedObjects(detected_criminals);
          setProgress(100);
          navigate("/results", { state: { detected_criminals, progress: 100, uploadedImageUrl } });
        } catch (error) {
          console.error("Error in loadAndDetect:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAndDetect();
  }, [uploadedImageData, criminals, navigate, confidenceThreshold]);

  const handleImageSelect = async (imageBase64: string) => {
    setLoading(true);
    setProgress(0);

    try {
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "selected_image.jpg", { type: "image/jpeg" });
      
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      
      console.log("inside!")
      const img = new Image();
      img.src = url;

      img.onload = async () => {
        try {
          const imageData = await urlToImageData(url);
          setUploadedImageData(imageData);
          
          // Call detect function here
          const detected_criminals = await detect(
            imageData,
            setProgress,
            confidenceThreshold
          );
          setDetectedObjects(detected_criminals);
          navigate("/results", { state: { detected_criminals, progress: 100, uploadedImageUrl: url } });
        } catch (error) {
          console.error("Error converting image to ImageData or detecting criminals:", error);
        }
      };

      img.onerror = (error) => {
        console.error("Error loading image:", error);
      };
    } catch (error) {
      console.error("Error selecting image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setProgress(0);

      try {
        const imageData = await urlToImageData(URL.createObjectURL(file));
        setUploadedImageData(imageData);
        setUploadedImageUrl(URL.createObjectURL(file));

        const detected_criminals = await detect(
          imageData,
          setProgress,
          confidenceThreshold
        );
        setDetectedObjects(detected_criminals);
        navigate("/results", { state: { detected_criminals, progress: 100, uploadedImageUrl: URL.createObjectURL(file) } });
      } catch (error) {
        console.error("Error uploading and processing image:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8">
        <p className="text-lg text-center">Select an image to detect criminals.</p>
        
        <div className="container mx-auto px-4 max-w-6xl">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg relative">
                  <img src={`data:image/jpeg;base64,${image}`} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {loading ? (
                      <div className="w-full px-4">
                        <p className="text-white text-center mb-2">Processing...</p>
                        <ProgressBar progress={progress} />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleImageSelect(image)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Run Prediction
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="aspect-square overflow-hidden rounded-lg relative border-2 border-dashed border-gray-400 flex items-center justify-center">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-gray-400">Upload Image</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <button
                onClick={() => navigate("/criminals-grid")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
              >
                View Criminals
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <label className="flex items-center justify-center space-x-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-300">Image</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={mode === 'video'} onChange={() => setMode(mode === 'image' ? 'video' : 'image')} />
              <div className={`block w-14 h-8 rounded-full transition ${mode === 'video' ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${mode === 'video' ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-gray-300">Video</span>
          </label>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <label htmlFor="confidenceSlider" className="block mb-2 font-semibold">Confidence Threshold: {confidenceThreshold}</label>
          <input
            id="confidenceSlider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="space-y-4">
          {detectedObjects.map((obj, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <p>Detected {obj.criminal.name} with similarity {obj.similarity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
