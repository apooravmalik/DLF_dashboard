import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FireContext } from "../../../context/FireContext";
import Chart from "../../../components/Chart";
import DoubleBarChart from "../../../components/DoubleBarChart";

const Fire_OverviewPage = () => {
  const navigate = useNavigate();
  const { fireData, loading, error, chartsData } = useContext(FireContext);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Prepare the data for the charts
  const alarmsData = {
    labels: fireData[0]?.overview_query?.legends || [],
    dataPoints: fireData[0]?.overview_query?.data.map((item) => item.count) || [],
    colors: ["#4C7CB2", "#78629A", "#EC0808"],
  };

  const deviceStatusData = {
    labels: fireData[1]?.overview_query?.legends || [],
    dataPoints: fireData[1]?.overview_query?.data.map((item) => item.count) || [],
    colors: ["#06245E", "#06A650", "#EC0808"],
  };

  // Updated formatHourlyTrendData function
  const formatHourlyTrendData = (data) => {
    // First, get all unique hour intervals
    const hours = [...new Set(data
      .filter(item => item.attribute === 'HourInterval')
      .map(item => item.count))]
      .sort((a, b) => parseInt(a) - parseInt(b));

    // Initialize hourly data structure
    const hourlyData = {};
    hours.forEach(hour => {
      hourlyData[hour] = {
        totalAlarms: 0,
        falseAlarms: 0,
        trueAlarms: 0
      };
    });

    // Group data by hour
    let currentHour = null;
    data.forEach(item => {
      if (item.attribute === 'HourInterval') {
        currentHour = item.count;
      } else if (currentHour !== null && hourlyData[currentHour]) {
        switch (item.attribute) {
          case 'Total Alarms':
            hourlyData[currentHour].totalAlarms = parseInt(item.count) || 0;
            break;
          case 'False Alarms':
            hourlyData[currentHour].falseAlarms = parseInt(item.count) || 0;
            break;
          case 'True Alarms':
            hourlyData[currentHour].trueAlarms = parseInt(item.count) || 0;
            break;
        }
      }
    });

    // Format the data for the chart
    const datasets = [
      {
        label: "Total Alarms",
        dataPoints: hours.map(hour => hourlyData[hour].totalAlarms),
        color: "#4C7CB2"
      },
      {
        label: "False Alarms",
        dataPoints: hours.map(hour => hourlyData[hour].falseAlarms),
        color: "#78629A"
      },
      {
        label: "True Alarms",
        dataPoints: hours.map(hour => hourlyData[hour].trueAlarms),
        color: "#EC0808"
      }
    ];

    return {
      labels: hours,
      datasets
    };
  };

  const hourlyTrendData = formatHourlyTrendData(fireData[2]?.overview_query?.data || []);

  // Handle the bar click event
  const handleBarClick = (attribute, chartIndex) => {
    const { drill_down_query, report_query } = chartsData[chartIndex] || {};
    const errorResponse = drill_down_query?.error;

    if (errorResponse && errorResponse === "query_obj for key 'drill_down_query' is None") {
      console.error(`Error: Drilldown data is missing for chart ${chartIndex}. Redirecting to ReportPage.`);
      if (report_query) {
        navigate(`/client/dashboard-1/report/${chartIndex}`, { state: { reportData: report_query } });
      } else {
        console.error("No report query found for this chart.");
      }
    } else {
      navigate(`/client/dashboard-1/drilldown/${chartIndex}`, { state: { drillDownData: drill_down_query } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="grid grid-cols-2 gap-2 px-4 pt-3">
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
        <div className="col-span-2 !h-40px">
          <DoubleBarChart
            chartIndex={2}
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
            onBarClick={handleBarClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Fire_OverviewPage;