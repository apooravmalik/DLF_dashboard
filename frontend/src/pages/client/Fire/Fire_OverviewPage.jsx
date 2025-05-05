import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FireContext } from "../../../context/FireContext";
import BigBarChart from "../../../components/BigBarChart";
import StackedBarChart from "../../../components/StackedBarChart";

const Fire_OverviewPage = () => {
  const navigate = useNavigate();
  const { fireData, loading, error } = useContext(FireContext);
  console.log("chartsData:", fireData);

  useEffect(() => {
    const currentPath = location.pathname;
    if (
      currentPath === "/client/fire/drilldown/2" &&
      fireData &&
      fireData[2]?.drill_down_query
    ) {
      const drillDownData = fireData[2]?.drill_down_query;
      navigate("/client/fire/drilldown/2", { state: { drillDownData } });
    }
  }, [fireData, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Prepare the data for the charts
  const alarmsData = {
    labels: fireData[0]?.overview_query?.legends || [],
    dataPoints:
      fireData[0]?.overview_query?.data.map((item) => item.count) || [],
    colors: ["#4C7CB2", "#78629A", "#EC0808"],
  };
  console.log("Device Status Data:", fireData[1]?.overview_query?.data);

  const deviceStatusData = {
    labels: ["Total", "Offline", "Online"],  // Labels for the chart
    dataPoints: [
      fireData[1]?.overview_query?.data?.find(item => item.attribute === "Total")?.count || 0,  // Total count (7)
      fireData[1]?.overview_query?.data?.find(item => item.attribute === "Offline")?.count || 0,  // Offline count (2)
      fireData[1]?.overview_query?.data?.find(item => item.attribute === "Online")?.count || 0   // Online count (5)
    ],
    colors: ["#06245E", "#EC0808", "#06A650"]  // Colors for each status
  };

  // Updated formatHourlyTrendData function
  const formatHourlyTrendData = (data) => {
    // First, get all unique hour intervals
    const hours = [
      ...new Set(
        data
          .filter((item) => item.attribute === "HourInterval")
          .map((item) => item.count)
      ),
    ].sort((a, b) => parseInt(a) - parseInt(b));

    // Initialize hourly data structure
    const hourlyData = {};
    hours.forEach((hour) => {
      hourlyData[hour] = {
        totalAlarms: 0,
        falseAlarms: 0,
        trueAlarms: 0,
      };
    });

    // Group data by hour
    let currentHour = null;
    data.forEach((item) => {
      if (item.attribute === "HourInterval") {
        currentHour = item.count;
      } else if (currentHour !== null && hourlyData[currentHour]) {
        switch (item.attribute) {
          case "Total Alarms":
            hourlyData[currentHour].totalAlarms = parseInt(item.count) || 0;
            break;
          case "False Alarms":
            hourlyData[currentHour].falseAlarms = parseInt(item.count) || 0;
            break;
          case "True Alarms":
            hourlyData[currentHour].trueAlarms = parseInt(item.count) || 0;
            break;
        }
      }
    });

    // Format the data for the chart
    const datasets = [
      {
        label: "Total Alarms",
        dataPoints: hours.map((hour) => hourlyData[hour].totalAlarms),
        color: "#4C7CB2",
      },
      {
        label: "False Alarms",
        dataPoints: hours.map((hour) => hourlyData[hour].falseAlarms),
        color: "#78629A",
      },
      {
        label: "True Alarms",
        dataPoints: hours.map((hour) => hourlyData[hour].trueAlarms),
        color: "#EC0808",
      },
    ];

    return {
      labels: hours,
      datasets,
    };
  };

  const hourlyTrendData = formatHourlyTrendData(
    fireData[2]?.overview_query?.data || []
  );

  // Handle the bar click event
  const handleBarClick = (attribute, chartIndex) => {
    console.log("handleBarClick called with:", { attribute, chartIndex });

    const { drill_down_query, report_query } = fireData[chartIndex] || {};
    const errorResponse = drill_down_query?.error;

    if (
      errorResponse &&
      errorResponse === "query_obj for key 'drill_down_query' is None"
    ) {
      console.error(
        `Error: Drilldown data is missing for chart ${chartIndex}. Redirecting to ReportPage.`
      );
      if (report_query) {
        console.log("Navigating to report page with data:", report_query);
        navigate(`/client/fire/report/${chartIndex}`, {
          state: { reportData: report_query },
        });
      } else {
        console.error("No report query found for this chart.");
      }
    } else {
      console.log("Navigating to drilldown page with data:", drill_down_query);
      navigate(`/client/fire/drilldown/${chartIndex}`, {
        state: { drillDownData: drill_down_query },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      <h1 className="text-2xl font-bold text-center">Fire Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <div className="bg-[#3f505d] rounded-lg shadow-md p-4">
          <BigBarChart
            labels={alarmsData.labels}
            dataPoints={alarmsData.dataPoints}
            title="ALARMS CHART"
            colors={alarmsData.colors}
            showValues
            onBarClick={(attribute) => handleBarClick(attribute, 0)}
          />
        </div>
        <div className="bg-[#3f505d] rounded-lg shadow-md p-4">
          <BigBarChart
			labels={deviceStatusData.labels}        // ["Total", "Offline", "Online"]
			dataPoints={deviceStatusData.dataPoints} // [7, 2, 5]
			title="IoT Device Status"
			colors={deviceStatusData.colors}        // ["#06245E", "#EC0808", "#06A650"]
			showValues
			onBarClick={(attribute) => handleBarClick(attribute, 1)}  // handle the bar click event
		  />
        </div>
        <div className="col-span-2 bg-[#3f505d] rounded-lg shadow-md p-4 overflow-hidden">
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
          <StackedBarChart
            labels={hourlyTrendData.labels}
            dataPoints={hourlyTrendData.datasets.map((d) => d.dataPoints)}
            title="Hourly Trend"
            colors={hourlyTrendData.datasets.map((d) => d.color)}
            showValues
            onBarClick={(attribute) => handleBarClick(attribute, 2)}
          />
        </div>
      </div>
    </div>
  );
};

export default Fire_OverviewPage;
