import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Criminal from "@/types/criminal";

const DeleteCriminal = () => {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [selectedCriminal, setSelectedCriminal] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCriminals = async () => {
      const response = await fetch("http://localhost:8000/list-criminals/");
      const data = await response.json();
      setCriminals(data);
    };

    loadCriminals();
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", selectedCriminal);

    try {
      const response = await fetch("http://localhost:8000/delete-criminal/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error deleting criminal");
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    handleSubmit();
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Delete Criminal</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="criminal" className="block text-sm font-medium text-gray-300">
              Select a criminal to delete:
            </label>
            <select
              id="criminal"
              value={selectedCriminal}
              onChange={(e) => setSelectedCriminal(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="">Select a criminal</option>
              {criminals.map((criminal, index) => (
                <option key={index} value={criminal.name}>
                  {criminal.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Delete Criminal
          </button>
        </form>
        {message && <p className="mt-4 text-green-400">{message}</p>}
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Back to Home
        </button>
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <p className="text-white mb-4">Are you sure you want to delete this criminal?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteCriminal;
