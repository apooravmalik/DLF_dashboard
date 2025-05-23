import { useEffect, useState, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";
import StackedBarChart from "../../../components/StackedBarChart";
import { FireContext } from "../../../context/FireContext";
import { useNavigate } from "react-router-dom";

const FireDrilldownPage = () => {
  const { chartIndex } = useParams();
  const { state } = useLocation();
  const { drillDownData } = state || {};
  console.log("Drill Down Data:", drillDownData);

  const navigate = useNavigate();
  const { fireData } = useContext(FireContext);
  console.log("Fire Data:", fireData);
  const [chartData, setChartData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(true);

  const isFullHeight = chartIndex === "2";

  const formatHourlyTrendData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    const hourlyData = data.map((item) => {
      const falseAlarms =
        item.counts.find((count) => count.type === "False Alarms")?.value || 0;
      const trueAlarms =
        item.counts.find((count) => count.type === "True Alarms")?.value || 0;
      const totalAlarms = falseAlarms + trueAlarms;

      return {
        hour: item.value,
        totalAlarms,
        falseAlarms,
        trueAlarms,
      };
    });

    hourlyData.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return {
      labels: hourlyData.map((item) => item.hour),
      datasets: [
        {
          label: "Total Alarms",
          dataPoints: hourlyData.map((item) => item.totalAlarms),
          color: "#4C7CB2",
        },
        {
          label: "False Alarms",
          dataPoints: hourlyData.map((item) => item.falseAlarms),
          color: "#78629A",
        },
        {
          label: "True Alarms",
          dataPoints: hourlyData.map((item) => item.trueAlarms),
          color: "#EC0808",
        },
      ],
    };
  };

  useEffect(() => {
    if (
      drillDownData &&
      drillDownData.data &&
      Array.isArray(drillDownData.data)
    ) {
      if (chartIndex === "0") {
        let falseAlarms = 0;
        let trueAlarms = 0;
        let totalAlarms = 0;

        drillDownData.data.forEach((item) => {
          falseAlarms +=
            item.counts.find((count) => count.type === "False Alarms")?.value ||
            0;
          trueAlarms +=
            item.counts.find((count) => count.type === "True Alarms")?.value ||
            0;
          totalAlarms += item.value || falseAlarms + trueAlarms;
        });

        setChartData([
          { label: "Total Alarms", value: totalAlarms },
          { label: "False Alarms", value: falseAlarms },
          { label: "True Alarms", value: trueAlarms },
        ]);
      } else if (chartIndex === "1") {
        const formattedData = drillDownData.data.map((item) => {
          return {
            buildingName: item.value,
            totalAlarms:
              item.counts.find((count) => count.type === "Total")?.value || 0,
            onlineAlarms:
              item.counts.find((count) => count.type === "Online")?.value || 0,
            offlineAlarms:
              item.counts.find((count) => count.type === "Offline")?.value || 0,
          };
        });

        setBuildingData(formattedData);
      } else if (chartIndex === "2") {
        const hourlyTrendData = formatHourlyTrendData(drillDownData.data);
        setChartData(hourlyTrendData);
      }
      setLoadingDrillDown(false);
    } else {
      setLoadingDrillDown(false);
      console.error("Invalid data structure:", drillDownData);
    }
  }, [drillDownData, chartIndex]);

  const handleBarClick = (label) => {
    const { report_query } = fireData[chartIndex] || {};

    if (report_query) {
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

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      <div className="px-4 pt-3">
        {loadingDrillDown ? (
          <div className="h-[calc(100vh-82px)] flex items-center justify-center">
            <div className="text-gray-400">Loading data...</div>
          </div>
        ) : chartIndex === "0" ? (
          <Chart
            labels={chartData.map((item) => item.label)}
            dataPoints={chartData.map((item) => item.value)}
            title={`Total Alarms - Zone Wise`}
            colors={["#4C7CB2", "#78629A", "#F44336"]}
            showValues
            onBarClick={handleBarClick}
          />
        ) : chartIndex === "1" ? (
          <DoubleBarChart
            labels={buildingData.map((item) => item.buildingName)}
            dataPoints={[
              buildingData.map((item) => item.onlineAlarms),
              buildingData.map((item) => item.offlineAlarms),
            ]}
            title={`Iot Device Status - Building Wise`}
            colors={["#00b050", "#ff0000"]}
            showValues
            chartIndex={chartIndex}
            isStacked={false}
            drillDownData={drillDownData}
            onBarClick={handleBarClick}
          />
        ) : (
          <>
            <div className="flex mb-4">
              <div className="flex items-center mr-8">
                <div className="w-4 h-4 bg-[#00b0f0] mr-2"></div>
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
            <div
              className={`bg-[#3f505d] p-4 rounded-lg shadow-md ${
                isFullHeight ? "h-[calc(100vh-120px)]" : "h-[25rem]"
              }`}
            >
              <StackedBarChart
                labels={chartData.labels}
                dataPoints={chartData.datasets.map((d) => d.dataPoints)}
                title={`Hourly Trend NCR-1`}
                colors={chartData.datasets.map((d) => d.color)}
                showValues
                onBarClick={handleBarClick}
                isFullHeight={isFullHeight}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FireDrilldownPage;
