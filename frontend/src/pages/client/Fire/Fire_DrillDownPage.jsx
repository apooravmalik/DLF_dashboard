import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";

const FireDrilldownPage = () => {
  const { chartIndex } = useParams(); // Get chart index from the route
  const { state } = useLocation(); // Get the passed state (drillDownData)
  const { drillDownData } = state || {}; // drillDownData passed from OverviewPage
  console.log("Drill Down Data:", drillDownData);

  const [chartData, setChartData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  useEffect(() => {
    if (
      drillDownData &&
      drillDownData.data &&
      Array.isArray(drillDownData.data)
    ) {
      if (chartIndex === "0") {
        // Aggregate totals
        let totalAlarms = 0;
        let falseAlarms = 0;
        let trueAlarms = 0;

        drillDownData.data.forEach((item) => {
          totalAlarms +=
            item.counts.find((count) => count.type === "Total Alarms")?.value ||
            0;
          falseAlarms +=
            item.counts.find((count) => count.type === "False Alarms")?.value ||
            0;
          trueAlarms +=
            item.counts.find((count) => count.type === "True Alarms")?.value ||
            0;
        });

        const aggregatedData = [
          { label: "Total Alarms", value: totalAlarms },
          { label: "False Alarms", value: falseAlarms },
          { label: "True Alarms", value: trueAlarms },
        ];

        console.log("Aggregated Data:", aggregatedData);
        setChartData(aggregatedData);
      } else if (chartIndex === "1") {
        // Building-wise aggregation
        const formattedData = drillDownData.data.map((item) => {
          const totalAlarms =
            item.counts.find((count) => count.type === "Total")?.value || 0;
          const onlineAlarms =
            item.counts.find((count) => count.type === "Online")?.value || 0;
          const offlineAlarms =
            item.counts.find((count) => count.type === "Offline")?.value || 0;

          return {
            buildingName: item.value,
            totalAlarms,
            onlineAlarms,
            offlineAlarms,
          };
        });

        console.log("Building-wise Data:", formattedData);
        setBuildingData(formattedData);
      }
      else if (chartIndex === "2") {
        // Hourly trend aggregation
        const hourlyData = drillDownData.data.map((item) => {
          const falseAlarms =
            item.counts.find((count) => count.type === "False Alarms")?.value ||
            0;
          const trueAlarms =
            item.counts.find((count) => count.type === "True Alarms")?.value ||
            0;

          return {
            hour: item.value,
            falseAlarms,
            trueAlarms,
          };
        });

        console.log("Hourly Data:", hourlyData);
        setChartData(hourlyData);
      }
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false); // No valid data structure
      console.error("Invalid data structure:", drillDownData);
    }
  }, [drillDownData, chartIndex]);

  if (loadingDrillDown) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-gray-400">Loading data...</div>
      </div>
    );
  }

  if (chartIndex === "0" && !chartData.length) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-red-500">No data available</div>
      </div>
    );
  }

  if (chartIndex === "1" && !buildingData.length) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-red-500">No data available</div>
      </div>
    );
  }

  if (chartIndex === "0") {
    const labels = chartData.map((item) => item.label);
    const dataPoints = chartData.map((item) => item.value);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="h-full flex flex-col">
          <div className="px-4 pt-3">
            <Chart
              labels={labels}
              dataPoints={dataPoints}
              title={`Aggregated Alarms for Chart ${chartIndex}`}
              colors={["#FF9800", "#F44336", "#4CAF50"]}
              showValues={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (chartIndex === "1") {
    const labels = buildingData.map((item) => item.buildingName);
    const onlineAlarms = buildingData.map((item) => item.onlineAlarms);
    const offlineAlarms = buildingData.map((item) => item.offlineAlarms);
    // Remove totalAlarms since we want just online/offline like in DrillDownPage

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="h-full flex flex-col">
          <div className="px-4 pt-3">
            {/* Legend for the colors */}
            <div className="flex mb-4">
              <div className="flex items-center mr-8">
                <div className="w-4 h-4 bg-[#4CAF50] mr-2"></div>
                <span>Online Alarms</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#F44336] mr-2"></div>
                <span>Offline Alarms</span>
              </div>
            </div>

            <DoubleBarChart
              labels={labels}
              dataPoints={[onlineAlarms, offlineAlarms]} // Only pass online and offline
              title={`Building-wise Alarms for Chart ${chartIndex}`}
              colors={["#4CAF50", "#F44336"]}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={false}
              drillDownData={drillDownData} // Make sure to pass this
            />
          </div>
        </div>
      </div>
    );
  }

  if (chartIndex === "2") {
    const labels = chartData.map((item) => item.hour); // Hours 00–23
    const falseAlarms = chartData.map((item) => item.falseAlarms);
    const trueAlarms = chartData.map((item) => item.trueAlarms);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="h-full flex flex-col">
          <div className="px-4 pt-3">
            {/* Legend for the colors */}
            <div className="flex mb-4">
              <div className="flex items-center mr-8">
                <div className="w-4 h-4 bg-[#F44336] mr-2"></div>
                <span>False Alarms</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#4CAF50] mr-2"></div>
                <span>True Alarms</span>
              </div>
            </div>

            <DoubleBarChart
              labels={labels}
              dataPoints={[falseAlarms, trueAlarms]}
              title={`Hourly Trend for Chart ${chartIndex}`}
              colors={["#F44336", "#4CAF50"]}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={true} // Stacked bar chart
              drillDownData={drillDownData} // Pass drillDownData if required
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default FireDrilldownPage;
