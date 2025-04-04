import { useState } from "react";
import AIContentCheck from "./AIContentCheck"; // Import AIContentCheck component
import RegularPlagiarismCheck from "./RegularPlagiarismCheck"; // Import RegularPlagiarismCheck component

const ViewPlagiarismResults = () => {
  const [view, setView] = useState(null);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-10/12">
      {/* Conditionally Render Based on View */}
      {view === "aiCheck" ? (
          <AIContentCheck onBack={()=> setView(null)}/>
      ) : view === "regularCheck" ? (
          <RegularPlagiarismCheck onBack={()=> setView(null)}/>
      ) : ( 
      <>
       
        <div className="flex space-x-4 mb-4">
          <button
            className="w-60 py-4 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setView("aiCheck")}
          >
            AI Content Check
          </button>
         
        </div>
      </>
    )}       
    </div>
  );
};

export default ViewPlagiarismResults;
