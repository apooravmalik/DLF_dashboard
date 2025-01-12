/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";

const FireDrilldownPage = () => {
  const { chartIndex } = useParams(); // Get the chartIndex from the URL

  // Hardcoded Data
  const alarmsData = {
    labels: ["Total Alarms", "False Alarms", "True Alarms"],
    dataPoints: [18, 18, 0],
    colors: ["#4C7CB2", "#78629A", "#EC0808"],
  };

  const deviceStatusData = {
    labels: ["Total", "Online", "Offline"],
    dataPoints: [3, 3, 0],
    colors: ["#06245E", "#06A650", "#EC0808"],
  };

  const hourlyTrendData = {
    labels: [
      "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
    ],
    datasets: [
      {
        label: "Total Alarms",
        dataPoints: [1, 1, 1, 1, 0, 0, 0, 3, 1, 0, 0, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        color: "#4C7CB2",
      },
      {
        label: "False Alarms",
        dataPoints: [1, 1, 1, 1, 0, 0, 0, 3, 1, 0, 0, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        color: "#78629A",
      },
      {
        label: "True Alarms",
        dataPoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: "#EC0808",
      },
    ],
  };

  // Define chartData based on chartIndex
  const chartData = [
    { data: alarmsData, path: "/client/fire/report/0", title: "ALARMS CHART" },
    { data: deviceStatusData, path: "/client/fire/report/1", title: "IoT Device Status" },
    {
      data: hourlyTrendData,
      path: "/client/fire/report/2",
      title: "Hourly Trend",
      isStacked: true,
      drillDownData: {
        data: hourlyTrendData.datasets.map((dataset) => ({
          counts: hourlyTrendData.datasets.map((d) => ({ type: d.label })),
        })),
      },
    },
  ];

  // Function to render chart based on chartIndex
  const renderChart = () => {
    const selectedChart = chartData[chartIndex]; // Select chart based on chartIndex

    if (selectedChart) {
      if (selectedChart.data.datasets) {
        // If it's a DoubleBarChart (like Hourly Trend)
        return (
            <div style={{width: "100%" }}> {/* Set desired height */}
              <DoubleBarChart
                labels={selectedChart.data.labels}
                dataPoints={selectedChart.data.datasets.map((d) => d.dataPoints)}
                title={selectedChart.title}
                colors={selectedChart.data.datasets.map((d) => d.color)}
                showValues={true}
                isStacked={selectedChart.isStacked}
                drillDownData={selectedChart.drillDownData}
                path={selectedChart.path}
              />
            </div>
          );
      } else {
        // For single data charts (like Alarms and IoT Device Status)
        return (
          <Chart
            labels={selectedChart.data.labels}
            dataPoints={selectedChart.data.dataPoints}
            title={selectedChart.title}
            colors={selectedChart.data.colors}
            showValues={true}
            path={selectedChart.path}
          />
        );
      }
    } else {
      return <div>Error: Invalid chart index</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center p-4">
        <h1 className="text-3xl font-semibold mb-4">{`Drilldown View for Chart ${chartIndex}`}</h1>
        {renderChart()}
      </div>
    </div>
  );
};

export default FireDrilldownPage;
