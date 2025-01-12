import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";

const DrillDownPage = () => {
  const { chartIndex } = useParams(); // Get the chart index from the route
  const { state } = useLocation(); // Get the passed state (drillDownData)
  const { drillDownData } = state || {}; // drillDownData passed from OverviewPage
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { chartsData } = useContext(AppContext); // Assuming chartsData is in context
  const [drillDownChartData, setDrillDownChartData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  useEffect(() => {
    if (
      drillDownData &&
      drillDownData.data &&
      Array.isArray(drillDownData.data)
    ) {
      const formattedData = drillDownData.data.map((item) => {
        const onlineCount =
          item.counts.find((count) => count.type === "Online")?.value || 0;
        const offlineCount =
          item.counts.find((count) => count.type === "Offline")?.value || 0;

        // Check the mapping to ensure correct values are being extracted
        console.log(
          `Building: ${item.value}, Online: ${onlineCount}, Offline: ${offlineCount}`
        );

        return {
          buildingName: item.value,
          onlineCount,
          offlineCount,
        };
      });

      console.log("Formatted Data:", formattedData); // Verify the formatted data
      setDrillDownChartData(formattedData);
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false); // No valid data structure
      console.error("Invalid data structure:", drillDownData);
    }
  }, [drillDownData]);

  const handleBarClick = (label) => {
    // Get the report_query for the current chart
    const { report_query } = chartsData[chartIndex] || {};

    if (report_query) {
      console.log(
        "Navigating to report with query and label:",
        report_query,
        label
      );
      navigate(`/client/dashboard-1/report/${chartIndex}`, {
        state: {
          reportData: report_query,
          label,
        },
      });
    } else {
      console.error("No report_query found for this chart.");
    }
  };

  if (loadingDrillDown) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-gray-400">Loading data...</div>
      </div>
    );
  }

  if (!drillDownChartData.length) {
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
          {/* Legend for the colors */}
          <div className="flex mb-4">
            <div className="flex items-center mr-8">
              <div className="w-4 h-4 bg-[#4CAF50] mr-2"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#F44336] mr-2"></div>
              <span>Offline</span>
            </div>
          </div>

          {chartIndex === "0" ? (
            <Chart
              labels={labels}
              dataPoints={onlineData}
              title={`Building-wise Online Status for Chart ${chartIndex}`}
              colors={Array(onlineData.length).fill("#4CAF50")}
              onBarClick={handleBarClick}
              showValues={true}
            />
          ) : (
            <DoubleBarChart
              labels={labels}
              dataPoints={[onlineData, offlineData]} // Pass the data as an array of arrays
              title={`Building-wise Online/Offline Status for Chart ${chartIndex}`}
              colors={["#4CAF50", "#F44336"]} // Colors for each dataset
              onBarClick={handleBarClick}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={false} // Explicitly set to false for grouped bars
              drillDownData={drillDownData} // Pass drillDownData here
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DrillDownPage;
