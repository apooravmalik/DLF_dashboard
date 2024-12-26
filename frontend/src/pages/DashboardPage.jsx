import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Chart from "../components/Chart";

const DashboardPage = () => {
  const { chartData } = useContext(AppContext);

  // Check if chartData exists and is an array
  if (!chartData || chartData.length === 0) {
    return <div>Loading...</div>; // Display loading state if chartData is empty or not available
  }

  return (
    <div className="h-screen flex flex-col items-center bg-[#18181B] text-white">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>

        {/* Grid Container for Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
          {/* Render a chart for each set of data */}
          {chartData.map((data, index) => (
            <div key={index} className="mb-8">
              <Chart
                labels={data.labels}
                dataPoints={data.dataPoints}
                title={`Bar Chart ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
