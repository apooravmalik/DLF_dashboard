import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Table from "../components/Table";

// Mock data for four queries
const mockResults = [
  [
    { attribute1: "Label1", value: 10 },
    { attribute1: "Label2", value: 20 },
    { attribute1: "Label3", value: 30 },
  ],
  [
    { attribute1: "LabelA", value: 15 },
    { attribute1: "LabelB", value: 25 },
    { attribute1: "LabelC", value: 35 },
  ],
  [
    { attribute1: "LabelX", value: 5 },
    { attribute1: "LabelY", value: 15 },
    { attribute1: "LabelZ", value: 25 },
  ],
  [
    { attribute1: "LabelP", value: 12 },
    { attribute1: "LabelQ", value: 22 },
    { attribute1: "LabelR", value: 32 },
  ],
];

const ReportPage = () => {
  const { queries, setQueryResults, setChartData } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!queries.length) {
      navigate("/query");
      return;
    }

    // Update state with mockResults for all tables
    setQueryResults(mockResults);

    // Prepare chart data for all queries
    const chartsData = mockResults.map((table) => ({
      labels: table.map((row) => row.attribute1),
      dataPoints: table.map((row) => row.value),
    }));

    setChartData(chartsData);
  }, [queries, navigate, setQueryResults, setChartData]);

  return (
    <div className="h-screen flex flex-col items-center bg-[#18181B] text-white">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-xl font-bold mb-4">Query Results</h1>

        {/* Grid Container for Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
          {/* Render four tables */}
          {mockResults.map((table, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Query {index + 1} Results</h2>
              <Table columns={["attribute1", "value"]} data={table} />
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-[#2196F3] text-white px-6 py-3 rounded-lg hover:bg-[#1976D2]"
        >
          Generate Charts
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
