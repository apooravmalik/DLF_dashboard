/* eslint-disable no-unused-vars */
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";

const Fire_OverviewPage = () => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="grid grid-cols-2 gap-2 px-4 pt-3">
        {/* Row 1 */}
        <Chart
          labels={alarmsData.labels}
          dataPoints={alarmsData.dataPoints}
          title="ALARMS CHART"
          colors={alarmsData.colors}
          showValues
          path="/client/fire/drilldown/0"
        />
        <Chart
          labels={deviceStatusData.labels}
          dataPoints={deviceStatusData.dataPoints}
          title="IoT Device Status"
          colors={deviceStatusData.colors}
          showValues
          path="/client/fire/drilldown/1"
        />
        {/* Row 2 */}
        <div className="col-span-2 !h-40px">
          <DoubleBarChart
            labels={hourlyTrendData.labels}
            dataPoints={hourlyTrendData.datasets.map((d) => d.dataPoints)}
            title="Hourly Trend"
            colors={hourlyTrendData.datasets.map((d) => d.color)}
            showValues
            isStacked
            drillDownData={{
              data: hourlyTrendData.datasets.map((dataset) => ({
                counts: hourlyTrendData.datasets.map((d) => ({ type: d.label })),
              })),
            }}
            path="/client/fire/drilldown/2"
          />
        </div>
      </div>
    </div>
  );
};

export default Fire_OverviewPage;