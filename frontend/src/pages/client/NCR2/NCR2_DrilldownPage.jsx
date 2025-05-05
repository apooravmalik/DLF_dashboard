import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { NCR2Context } from "../../../context/NCR2Context";
import DoubleBarChart from "../../../components/DoubleBarChart";

const NCR2_DrillDownPage = () => {
  const { chartIndex } = useParams();
  const { state } = useLocation();
  const { drillDownData } = state || {};
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { chartsData } = useContext(NCR2Context);
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

        console.log(
          `Building: ${item.value}, Online: ${onlineCount}, Offline: ${offlineCount}`
        );

        return {
          buildingName: item.value,
          onlineCount,
          offlineCount,
        };
      });

      console.log("Formatted Data:", formattedData);
      setDrillDownChartData(formattedData);
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false);
      console.error("Invalid data structure:", drillDownData);
    }
  }, [drillDownData]);

  const handleBarClick = (label, status) => {
    const { report_query } = chartsData[chartIndex] || {};

    if (report_query) {
      console.log(
        "Navigating to report with query and label:",
        report_query,
        label,
        status
      );
      navigate(`/client/NCR2/report/${chartIndex}`, {
        state: {
          report_query,
          label,
          status
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
    <div className= "min-h-screen bg-[#33414C] text-white">
      <div className="h-full flex flex-col">
        <div className="px-4 pt-3">
          {/* Legend for the colors */}
          <div className="flex mb-4">
            <div className="flex items-center mr-8">
              <div className="w-4 h-4 bg-[#00b050] mr-2"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#ff0000] mr-2"></div>
              <span>Offline</span>
            </div>
          </div>

          {(chartIndex === "0" || chartIndex === "1") && (
            <DoubleBarChart
              labels={labels}
              dataPoints={[onlineData, offlineData]}
              title={`Recorder Status Building Wise`}
              colors={["#00b050", "#ff0000"]}
              onBarClick={handleBarClick}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={false}
              drillDownData={drillDownData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NCR2_DrillDownPage;