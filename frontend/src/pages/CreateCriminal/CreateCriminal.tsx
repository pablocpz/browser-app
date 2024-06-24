import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@/config';

const CreateCriminal = () => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    handleSubmit();
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    // setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/create-criminal/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Criminal created successfully');
        setName('');
        setFiles([]);
      } else {
        setMessage('Failed to create criminal');
      }
    } catch (error) {
      console.error('Error creating criminal:', error);
      setMessage('Error creating criminal');
    } finally {
      // setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(true);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Create Criminal</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name:
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-300">
              Files:
            </label>
            <input
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Create Criminal
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
              <p className="text-white mb-4">Are you sure you want to create this criminal?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
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

export default CreateCriminal;
