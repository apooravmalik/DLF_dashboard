import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import SQLQueryForm from "../components/SQLQueryForm";
import config from "../config/config";

const QueryPage = () => {
  const { setChartData, setQueries } = useContext(AppContext);
  const [queries, setLocalQueries] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  const handleSubmit = async (queries) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/get-chart-data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queries }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
  
      const chartData = await response.json();
      console.log("Chart Data:", chartData);
  
      // Ensure the correct data structure is set
      setChartData(chartData);
      setQueries(chartData); // Use the API response directly as queries
      setApiResponse(chartData);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#18181B] text-white">
      <SQLQueryForm
        onSubmit={(submittedQueries) => {
          setLocalQueries(submittedQueries);
          handleSubmit(submittedQueries);
        }}
      />
      {apiResponse && (
        <Link
          to="/report"
          state={{ chartData: apiResponse, queries }}
          className="mt-4 bg-[#2196F3] text-white px-6 py-3 rounded-lg hover:bg-[#1976D2]"
        >
          Go to Report
        </Link>
      )}
    </div>
  );
};

export default QueryPage;
