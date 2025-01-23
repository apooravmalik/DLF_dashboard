import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DoubleBarChart from "../../../components/DoubleBarChart";
import Table from "../../../components/Table";

const Fire_ReportPage = () => {
  const { chartIndex } = useParams();
  const location = useLocation();
  const [reportData, setReportData] = useState({
    alarmsChart: null,
    deviceStatus: null,
    hourlyTrend: null,
  });

  useEffect(() => {
    if (location.state?.reportData) {
      console.log("Report Data Received in Fire_ReportPage:", location.state.reportData);
      processReportData(location.state.reportData);
    } else {
      console.error("No report data received in location.state.");
    }
  }, [location.state]);

  const processReportData = (data) => {
    if (!data || !Array.isArray(data)) {
      console.error("Invalid report data:", data);
      return;
    }

    const alarmsChart = {
      labels: [],
      datasets: [
        { label: "Total Alarms", dataPoints: [], color: "#4C7CB2" },
        { label: "False Alarms", dataPoints: [], color: "#78629A" },
        { label: "True Alarms", dataPoints: [], color: "#EC0808" },
      ],
    };

    const deviceStatus = [];
    const hourlyTrend = {
      labels: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
      datasets: [
        { label: "Total Alarms", dataPoints: Array(24).fill(0), color: "#4C7CB2" },
        { label: "False Alarms", dataPoints: Array(24).fill(0), color: "#78629A" },
      ],
    };

    data.forEach((item) => {
      const { attribute, count } = item;

      if (attribute === "Building Name") {
        if (!alarmsChart.labels.includes(count)) {
          alarmsChart.labels.push(count);
          alarmsChart.datasets.forEach((dataset) => dataset.dataPoints.push(0));
        }
      } else if (attribute === "Total Alarms" || attribute === "False Alarms" || attribute === "True Alarms") {
        const index = alarmsChart.labels.findIndex((label) => label === item.buildingName || label === "GatewayTower");
        const datasetIndex = attribute === "Total Alarms" ? 0 : attribute === "False Alarms" ? 1 : 2;
        if (index !== -1) alarmsChart.datasets[datasetIndex].dataPoints[index] += parseInt(count, 10) || 0;
      } else if (["Device Name", "IP Detail", "Status"].includes(attribute)) {
        const lastDevice = deviceStatus[deviceStatus.length - 1];
        if (!lastDevice || lastDevice[attribute]) {
          deviceStatus.push({ [attribute]: count });
        } else {
          lastDevice[attribute] = count;
        }
      }
    });

    setReportData({ alarmsChart, deviceStatus, hourlyTrend });
  };

  const handleBarClick = (attribute, index) => {
    console.log(`Bar clicked: Attribute - ${attribute}, Index - ${index}`);
  };

  const renderContent = () => {
    switch (chartIndex) {
      case "0":
        return reportData.alarmsChart ? (
          <DoubleBarChart
            labels={reportData.alarmsChart.labels}
            dataPoints={reportData.alarmsChart.datasets.map((d) => d.dataPoints)}
            title="Alarm Building Wise Report"
            colors={reportData.alarmsChart.datasets.map((d) => d.color)}
            showValues
            isStacked
            onBarClick={handleBarClick}
          />
        ) : (
          <div>Loading alarms chart...</div>
        );
      case "1":
        return reportData.deviceStatus ? (
          <Table columns={["Device Name", "IP Detail", "Status"]} data={reportData.deviceStatus} />
        ) : (
          <div>Loading device status...</div>
        );
      case "2":
        return reportData.hourlyTrend ? (
          <Table
            columns={["Hour", "Total Alarms", "False Alarms"]}
            data={reportData.hourlyTrend.labels.map((hour, index) => ({
              Hour: hour,
              "Total Alarms": reportData.hourlyTrend.datasets[0].dataPoints[index],
              "False Alarms": reportData.hourlyTrend.datasets[1].dataPoints[index],
            }))}
          />
        ) : (
          <div>Loading hourly trend...</div>
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
