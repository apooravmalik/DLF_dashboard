import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { RJOCLiveContext } from "../../../context/RJOCLiveContext";
import DoubleBarChart from "../../../components/DoubleBarChart";

const RJOCLive_DrilldownPage = () => {
  const { chartIndex } = useParams();
  const { state } = useLocation();
  const { drillDownData } = state || {};
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { chartsData } = useContext(RJOCLiveContext);
  const [drillDownChartData, setDrillDownChartData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  useEffect(() => {
    if (drillDownData?.data && Array.isArray(drillDownData.data)) {
      const formattedData = drillDownData.data.map((item) => {
        return {
          buildingName: item.value,
          onlineCount:
            item.counts.find((count) => count.type === "Online")?.value || 0,
          offlineCount:
            item.counts.find((count) => count.type === "Offline")?.value || 0,
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

  const handleBarClick = (label) => {
    const { report_query } = chartsData[chartIndex] || {};
    if (report_query) {
      navigate(`/client/rjoclive/report/${chartIndex}`, {
        state: { reportData: report_query, label },
      });
    } else {
      console.error("No report_query found for this chart.");
    }
  };

  if (loadingDrillDown) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center text-gray-400">
        Loading data...
      </div>
    );
  }

  if (!drillDownChartData.length) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center text-red-500">
        No data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      <div className="h-full flex flex-col px-4 pt-3">
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
        <DoubleBarChart
          labels={drillDownChartData.map((item) => item.buildingName)}
          dataPoints={[
            drillDownChartData.map((item) => item.onlineCount),
            drillDownChartData.map((item) => item.offlineCount),
          ]}
          title={`Building-wise Online/Offline Status for Chart ${chartIndex}`}
          colors={["#00b050", "#ff0000"]}
          onBarClick={handleBarClick}
          showValues={true}
        />
      </div>
    </div>
  );
};

export default RJOCLive_DrilldownPage;
