import { useContext } from "react";
import { AppContext } from "../context/AppContext"; // Import AppContext
import Chart from "../components/Chart";

const DashboardPage = () => {
  const { chartData } = useContext(AppContext); // Get chartData from the context

  // Check if chartData exists and is an array
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#18181B] text-white">
        No data available to display charts.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center bg-[#18181B] text-white">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-xl font-bold mb-4 text-gray-100">Dashboard</h1>

        {/* Grid Container for Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Render a chart for each set of data */}
          {chartData.map((data, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-md">
              <Chart
                labels={data.labels}
                dataPoints={data.dataPoints}
                title={data.title || `Chart ${index + 1}`}
                colors={data.colors} // Pass colors to the chart
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
