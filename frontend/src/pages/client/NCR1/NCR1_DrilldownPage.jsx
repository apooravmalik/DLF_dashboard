import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { NCR1Context } from "../../../context/NCR1Context";
import DoubleBarChart from "../../../components/DoubleBarChart";

const NCR1_DrillDownPage = () => {
  const { chartIndex } = useParams();
  const { state } = useLocation();
  const { drillDownData } = state || {};

  const navigate = useNavigate();
  const { chartsData } = useContext(NCR1Context);
  const [drillDownChartData, setDrillDownChartData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  useEffect(() => {
    console.log("DrillDownPage: chartIndex:", chartIndex);
    console.log("DrillDownPage: drillDownData:", drillDownData);

    if (!drillDownData) {
      console.error("No drilldown data provided");
      setLoadingDrillDown(false);
      return;
    }

    if (drillDownData?.data && Array.isArray(drillDownData.data)) {
      const formattedData = drillDownData.data.map((item) => {
        const onlineCount = item.counts?.find((c) => c.type === "Online")?.value || 0;
        const offlineCount = item.counts?.find((c) => c.type === "Offline")?.value || 0;
        return {
          buildingName: item.value || item.buildingName,
          onlineCount: Number(onlineCount),
          offlineCount: Number(offlineCount),
        };
      });
      console.log("Formatted DrillDown Data:", formattedData);
      setDrillDownChartData(formattedData);
      setLoadingDrillDown(false);
    } else {
      console.error("Invalid drilldown data structure:", drillDownData);
      setLoadingDrillDown(false);
    }
  }, [drillDownData, chartIndex]);

  const handleBarClick = (label, status) => {
    console.log("handleBarClick:", { chartIndex, label });
    if (chartIndex === "camera") {
      navigate(`/client/NCR1/report/camera`, {
        state: {
          reportData: { building: label },
          chartIndex: chartIndex,
          label: label,
          status: status
        },
      });
    } else {
      const { report_query } = chartsData[chartIndex] || {};
      if (report_query) {
        navigate(`/client/NCR1/report/${chartIndex}`, {
          state: {
            reportData: report_query,
            chartIndex: chartIndex,
            label,
            status
          },
        });
      } else {
        console.error("No report_query found for this chart.");
      }
    }
  };

  if (loadingDrillDown) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading data...</div>
      </div>
    );
  }

  if (!drillDownChartData.length) {
    console.error("No drilldown chart data available");
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">No data available</div>
      </div>
    );
  }

  const labels = drillDownChartData.map((item) => item.buildingName);
  const onlineData = drillDownChartData.map((item) => item.onlineCount);
  const offlineData = drillDownChartData.map((item) => item.offlineCount);

  console.log("Rendering DoubleBarChart with:", { labels, onlineData, offlineData });

  return (
    <div className="flex flex-col text-white bg-[#33414C]">
      <div className="px-4 pt-3 flex-shrink-0">
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
      </div>
      <div className="h-[643px] w-[1498px]">
        {chartIndex === "0" && (
          <DoubleBarChart
            labels={labels}
            dataPoints={[onlineData, offlineData]}
            title="Recorder Status Building Wise"
            colors={["#00b050", "#ff0000"]}
            onBarClick={handleBarClick}
            showValues={true}
            isStacked={false}
            drillDownData={drillDownData}
            chartIndex={chartIndex}
          />
        )}

        {chartIndex === "1" && (
          <DoubleBarChart
            labels={labels}
            dataPoints={[onlineData, offlineData]}
            title="Camera Status Building Wise"
            colors={["#00b050", "#ff0000"]}
            onBarClick={handleBarClick}
            showValues={true}
            isStacked={false}
            drillDownData={drillDownData}
            chartIndex={chartIndex}
          />
        )}

        {chartIndex === "2" && (
          <DoubleBarChart
            labels={labels}
            dataPoints={[onlineData, offlineData]}
            title="ACS Status Building Wise"
            colors={["#00b050", "#ff0000"]}
            onBarClick={handleBarClick}
            showValues={true}
            isStacked={false}
            drillDownData={drillDownData}
            chartIndex={chartIndex}
          />
        )}

        {chartIndex === "3" && (
          <DoubleBarChart
            labels={labels}
            dataPoints={[onlineData, offlineData]}
            title="Flap Barrier Status Building Wise"
            colors={["#00b050", "#ff0000"]}
            onBarClick={handleBarClick}
            showValues={true}
            isStacked={false}
            drillDownData={drillDownData}
            chartIndex={chartIndex}
          />
        )}
      </div>
    </div>
  );
};

export default NCR1_DrillDownPage;
