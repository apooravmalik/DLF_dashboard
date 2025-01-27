import { useEffect, useState, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";
import { FireContext } from "../../../context/FireContext";
import { useNavigate } from "react-router-dom";

const FireDrilldownPage = () => {
  const { chartIndex } = useParams(); // Get chart index from the route
  const { state } = useLocation(); // Get the passed state (drillDownData)
  const { drillDownData } = state || {}; // drillDownData passed from OverviewPage
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { fireData } = useContext(FireContext);
  console.log("Fire Data:", fireData);
  const [chartData, setChartData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  const formatHourlyTrendData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Format the data to match the overview page structure
    const hourlyData = data.map((item) => {
      const falseAlarms = item.counts.find(count => count.type === "False Alarms")?.value || 0;
      const trueAlarms = item.counts.find(count => count.type === "True Alarms")?.value || 0;
      const totalAlarms = falseAlarms + trueAlarms;

      return {
        hour: item.value,
        totalAlarms,
        falseAlarms,
        trueAlarms
      };
    });

    // Sort by hour
    hourlyData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return {
      labels: hourlyData.map(item => item.hour),
      datasets: [
        {
          label: "Total Alarms",
          dataPoints: hourlyData.map(item => item.totalAlarms),
          color: "#4C7CB2"
        },
        {
          label: "False Alarms",
          dataPoints: hourlyData.map(item => item.falseAlarms),
          color: "#78629A"
        },
        {
          label: "True Alarms",
          dataPoints: hourlyData.map(item => item.trueAlarms),
          color: "#EC0808"
        }
      ]
    };
  };

  useEffect(() => {
    if (
      drillDownData &&
      drillDownData.data &&
      Array.isArray(drillDownData.data)
    ) {
      if (chartIndex === "0") {
        // Aggregate totals
        let falseAlarms = 0;
        let trueAlarms = 0;
        let totalAlarms = 0;
      
        drillDownData.data.forEach((item) => {
          falseAlarms +=
            item.counts.find((count) => count.type === "False Alarms")?.value || 0;
          trueAlarms +=
            item.counts.find((count) => count.type === "True Alarms")?.value || 0;
      
          // Use 'value' field if 'Total Alarms' is not explicitly provided
          totalAlarms += item.value || falseAlarms + trueAlarms;
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
      } else if (chartIndex === "2") {
        // Hourly trend
        const hourlyTrendData = formatHourlyTrendData(drillDownData.data);
        console.log("Hourly Data:", hourlyTrendData);
        setChartData(hourlyTrendData);
      }
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false); // No valid data structure
      console.error("Invalid data structure:", drillDownData);
    }
  }, [drillDownData, chartIndex]);

  const handleBarClick = (label) => {
    // Get the report_query for the current chart
    const { report_query } = fireData[chartIndex] || {};

    if (report_query) {
      console.log(
        "Navigating to report with query and label:",
        report_query,
        label
      );
      navigate(`/client/fire/report/${chartIndex}`, {
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
              colors={["#4C7CB2", "#78629A", "#F44336"]}
              showValues={true}
              onBarClick={handleBarClick}
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
              dataPoints={[onlineAlarms, offlineAlarms]}
              title={`Building-wise Alarms for Chart ${chartIndex}`}
              colors={["#4CAF50", "#F44336"]}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={false}
              drillDownData={drillDownData}
              onBarClick={handleBarClick}
            />
          </div>
        </div>
      </div>
    );
  }

  if (chartIndex === "2") {
    const hourlyTrendData = chartData;
    
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="h-full flex flex-col">
          <div className="px-4 pt-3">
            <div className="flex mb-4">
              <div className="flex items-center mr-8">
                <div className="w-4 h-4 bg-[#4C7CB2] mr-2"></div>
                <span>Total Alarms</span>
              </div>
              <div className="flex items-center mr-8">
                <div className="w-4 h-4 bg-[#78629A] mr-2"></div>
                <span>False Alarms</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#EC0808] mr-2"></div>
                <span>True Alarms</span>
              </div>
            </div>

            <DoubleBarChart
              labels={hourlyTrendData.labels}
              dataPoints={hourlyTrendData.datasets.map(d => d.dataPoints)}
              title={`Hourly Trend for Chart ${chartIndex}`}
              colors={hourlyTrendData.datasets.map(d => d.color)}
              showValues={true}
              chartIndex={chartIndex}
              isStacked={true}
              drillDownData={drillDownData}
              onBarClick={handleBarClick}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FireDrilldownPage;