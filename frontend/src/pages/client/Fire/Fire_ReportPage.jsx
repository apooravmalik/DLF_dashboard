import DoubleBarChart from "../../../components/DoubleBarChart";
import Table from "../../../components/Table";
import { useParams } from "react-router-dom";

const Fire_ReportPage = () => {
  const { chartIndex } = useParams();

  // Report data for all charts
  const reportData = {
    alarmsChart: {
      labels: ["Building 10", "Building 8", "Gateway/Tower"],
      datasets: [
        {
          label: "Total Alarms",
          dataPoints: [10, 6, 2],
          color: "#4C7CB2",
        },
        {
          label: "False Alarms",
          dataPoints: [10, 6, 2],
          color: "#78629A",
        },
        {
          label: "True Alarms",
          dataPoints: [0, 0, 0],
          color: "#EC0808",
        },
      ],
    },
    deviceStatus: [
      {
        "Device Name": "Fire panel building 8",
        "IP Detail": "10.100.16.4",
        Status: "Online",
      },
      {
        "Device Name": "Fire panel building 10",
        "IP Detail": "10.100.1.2",
        Status: "Online",
      },
      {
        "Device Name": "Fire panel Gateway Tower",
        "IP Detail": "10.100.24.4",
        Status: "Online",
      },
    ],
    hourlyTrend: {
      labels: [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
        "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
      ],
      datasets: [
        {
          label: "Total Alarms",
          dataPoints: [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
          color: "#4C7CB2",
        },
        {
          label: "False Alarms",
          dataPoints: [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
          color: "#78629A",
        },
      ],
    },
  };

  const renderContent = () => {
    switch (chartIndex) {
      case "0": // Alarms Chart
        return (
          <DoubleBarChart
            labels={reportData.alarmsChart.labels}
            dataPoints={reportData.alarmsChart.datasets.map((d) => d.dataPoints)}
            title="Alarms Chart"
            colors={reportData.alarmsChart.datasets.map((d) => d.color)}
            showValues
            isStacked
          />
        );
      case "1": // IoT Device Status
        return (
          <Table
            columns={["Device Name", "IP Detail", "Status"]}
            data={reportData.deviceStatus}
          />
        );
      case "2": // Hourly Trend
        return (
          <DoubleBarChart
            labels={reportData.hourlyTrend.labels}
            dataPoints={reportData.hourlyTrend.datasets.map((d) => d.dataPoints)}
            title="Hourly Trend"
            colors={reportData.hourlyTrend.datasets.map((d) => d.color)}
            showValues
            isStacked
          />
        );
      default:
        return <div>No report data available for this chart index.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Fire Client Report</h1>
      <div className="mb-8">{renderContent()}</div>
    </div>
  );
};

export default Fire_ReportPage;
