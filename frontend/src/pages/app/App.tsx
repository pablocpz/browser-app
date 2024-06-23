import CreateCriminal from "../CreateCriminal/CreateCriminal";
import DeleteCriminal from "../DeleteCriminal/DeleteCriminal";
import EditCriminal from "../EditCriminal/EditCriminal";
import Home from "../Home/Home";
import Results from "@/pages/Results/Results";
import CriminalsGrid from "../CriminalsGrid/CriminalsGrid";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Criminal Detection App</h1>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-criminal" element={<CreateCriminal />} />
            <Route path="/delete-criminal" element={<DeleteCriminal />} />
            <Route path="/edit-criminal" element={<EditCriminal />} />
            <Route path="/results" element={<Results />} />
            <Route path="/criminals-grid" element={<CriminalsGrid />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;
