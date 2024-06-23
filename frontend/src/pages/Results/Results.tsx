import { useLocation, useNavigate } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import { imageDataToUrl } from "@/utils/imageConversion";
import DetectedCriminal from "@/types/detectedCriminal";
import "./Results.css"; // Import the CSS file

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const { detected_criminals, progress, uploadedImageUrl } = location.state as {
    detected_criminals: DetectedCriminal[];
    progress: number;
    uploadedImageUrl: string;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-white text-center">Detection Results</h1>
        {progress < 100 ? (
          <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-lg">
            <p className="mb-2 text-center">Detecting criminals, please wait...</p>
            <ProgressBar progress={progress} />
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">Uploaded Image</h2>
              <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-auto rounded-lg" />
            </div>
            <div className="space-y-4">
              {detected_criminals.map((obj, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <p className="text-center">Detected {obj.criminal.name} with {obj.similarity}% similarity</p>
                </div>
              ))}
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
