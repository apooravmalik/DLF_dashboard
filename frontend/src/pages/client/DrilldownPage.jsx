// DrillDownPage.jsx
import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Chart from "../../components/Chart";
import DoubleBarChart from "../../components/DoubleBarChart";


const DrillDownPage = () => {
  const { chartIndex } = useParams(); // Get the chart index from the route
  const { state } = useLocation(); // Get the passed state (drillDownData)
  const { drillDownData } = state || {}; // drillDownData passed from OverviewPage
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { loading, error } = useContext(AppContext);

  const [drillDownChartData, setDrillDownChartData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  useEffect(() => {
    // Ensure drillDownData has the correct structure
    if (
      drillDownData &&
      drillDownData.data &&
      Array.isArray(drillDownData.data)
    ) {
      const selectedChartData = drillDownData.data;
      console.log("Selected Chart Data:", selectedChartData);

      // Process the data to extract necessary values
      const formattedData = selectedChartData.map((item) => ({
        buildingName: item.value, // Building Name is in the `value` field
        onlineCount:
          item.counts.find((count) => count.type === "Online Count")?.value ||
          0,
        offlineCount:
          item.counts.find((count) => count.type === "Offline Count")?.value ||
          0,
      }));

      setDrillDownChartData(formattedData);
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false); // No valid data structure
    }
  }, [drillDownData]);

  if (loading || loadingDrillDown) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-gray-400">Loading data...</div>
      </div>
    );
  }

  if (error || !drillDownChartData.length) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-red-500">No data available</div>
      </div>
    );
  }

  const labels = drillDownChartData.map((item) => item.buildingName);
  const onlineData = drillDownChartData.map((item) => item.onlineCount);
  const offlineData = drillDownChartData.map((item) => item.offlineCount);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-full flex flex-col">
        <div className="px-4 pt-3">
          {chartIndex === "0" ? (
            <Chart
              labels={labels}
              dataPoints={onlineData}
              title={`Building-wise Online Status for Chart ${chartIndex}`}
              colors={Array(onlineData.length).fill("#4CAF50")}
              onBarClick={(label) => navigate(`/report/${chartIndex}`, { state: { label } })}
              showValues={true}
            />
          ) : (
            <DoubleBarChart
              labels={labels}
              dataPoints={[onlineData, offlineData]}
              title={`Building-wise Online/Offline Status for Chart ${chartIndex}`}
              colors={["#4CAF50", "#F44336"]}
              onBarClick={(label) => navigate(`/report/${chartIndex}`, { state: { label } })}
              showValues={true}
              chartIndex={chartIndex}
            />
          )}
        </div>
      </div>
    </div>
  );  
};

export default DrillDownPage;
