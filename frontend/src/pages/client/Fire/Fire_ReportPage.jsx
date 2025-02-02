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
      console.log(
        "Report Data Received in Fire_ReportPage:",
        location.state.reportData
      );
      processReportData(location.state.reportData);
    } else {
      console.error("No report data received in location.state.");
    }
  }, [location.state]);

  const processReportData = (data) => {
    if (!data.data || !Array.isArray(data.data)) {
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
      labels: Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0")
      ),
      datasets: [
        {
          label: "Total Alarms",
          dataPoints: Array(24).fill(0),
          color: "#4C7CB2",
        },
        {
          label: "False Alarms",
          dataPoints: Array(24).fill(0),
          color: "#78629A",
        },
      ],
    };

    let currentBuilding = null;
    const buildingData = {};

    data.data.forEach((item) => {
      const { attribute, count } = item;

      // Process for chartIndex 0 (alarmsChart)
      if (attribute === "Building") {
        currentBuilding = count;
        if (!buildingData[currentBuilding]) {
          buildingData[currentBuilding] = {
            falseAlarms: 0,
            trueAlarms: 0,
            totalAlarms: 0,
          };
        }
      } else if (
        ["Total Alarms", "False Alarms", "True Alarms"].includes(attribute)
      ) {
        if (currentBuilding) {
          if (attribute === "False Alarms") {
            buildingData[currentBuilding].falseAlarms =
              parseInt(count, 10) || 0;
          } else if (attribute === "True Alarms") {
            buildingData[currentBuilding].trueAlarms = parseInt(count, 10) || 0;
          } else if (attribute === "Total Alarms") {
            buildingData[currentBuilding].totalAlarms =
              parseInt(count, 10) || 0;
          }
        }
      }

      // Process for chartIndex 1 (deviceStatus)
      if (["Device Name", "IP Detail", "Status"].includes(attribute)) {
        const lastDevice = deviceStatus[deviceStatus.length - 1];
        if (!lastDevice || lastDevice[attribute]) {
          deviceStatus.push({ [attribute]: count });
        } else {
          lastDevice[attribute] = count;
        }
      }

      // Process for chartIndex 2 (hourlyTrend)
      if (attribute === "Hour") {
        const hour = parseInt(count, 10);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          const totalAlarms = parseInt(item.totalAlarms, 10) || 0;
          const falseAlarms = parseInt(item.falseAlarms, 10) || 0;
          hourlyTrend.datasets[0].dataPoints[hour] += totalAlarms;
          hourlyTrend.datasets[1].dataPoints[hour] += falseAlarms;
        }
      }
    });

    // Finalize chart data for chartIndex 0
    Object.entries(buildingData).forEach(([buildingName, values]) => {
      alarmsChart.labels.push(buildingName);
      alarmsChart.datasets[0].dataPoints.push(
        values.falseAlarms + values.trueAlarms // Total Alarms derived dynamically
      );
      alarmsChart.datasets[1].dataPoints.push(values.falseAlarms);
      alarmsChart.datasets[2].dataPoints.push(values.trueAlarms);
    });

    setReportData({
      alarmsChart,
      deviceStatus,
      hourlyTrend,
    });
  };

  const handleBarClick = (attribute, index) => {
    console.log(`Bar clicked: Attribute - ${attribute}, Index - ${index}`);
  };

  const renderContent = () => {
    switch (chartIndex) {
      case "0":
        return reportData.alarmsChart ? (
          <>
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
                <div className="w-4 h-4 bg-[#F44336] mr-2"></div>
                <span>True Alarms</span>
              </div>
            </div>
            <DoubleBarChart
              labels={reportData.alarmsChart.labels}
              dataPoints={reportData.alarmsChart.datasets.map(
                (d) => d.dataPoints
              )}
              title="Alarm Building Wise Report"
              colors={reportData.alarmsChart.datasets.map((d) => d.color)}
              chartIndex={chartIndex}
              showValues
              isStacked
              onBarClick={handleBarClick}
              drillDownData={reportData}
            />
          </>
        ) : (
          <div>Loading alarms chart...</div>
        );
      case "1":
        return reportData.deviceStatus ? (
          <Table
            columns={["Device Name", "IP Detail", "Status"]}
            data={reportData.deviceStatus}
          />
        ) : (
          <div>Loading device status...</div>
        );
      case "2":
        return reportData.hourlyTrend ? (
          <Table
            columns={["Hour", "Total Alarms", "False Alarms"]}
            data={reportData.hourlyTrend.labels.map((hour, index) => ({
              Hour: hour,
              "Total Alarms":
                reportData.hourlyTrend.datasets[0].dataPoints[index],
              "False Alarms":
                reportData.hourlyTrend.datasets[1].dataPoints[index],
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
      <h1 className="text-2xl font-bold text-center mb-6">
        Fire Client Report
      </h1>
      <div className="mb-8">{renderContent()}</div>
    </div>
  );
};

export default Fire_ReportPage;
