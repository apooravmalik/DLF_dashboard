import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NCR1Context } from "../../../context/NCR1Context";
import Chart from "../../../components/Chart";

const NCR1_OverviewPage = () => {
  const contextValue = useContext(NCR1Context);
  const { chartsData = [], loading: loadingLiveData = false, error: liveDataError = null } = contextValue;
  const navigate = useNavigate();

  // Color mappings
  const colorMapping = {
    Total: "#00b0f0",
    Online: "#00b050",
    Offline: "#ff0000",
  };
  const defaultColor = "#808080";

  // Log chartsData for debugging
  useEffect(() => {
    console.log("OverviewPage: chartsData:", chartsData);
  }, [chartsData]);

  // Handle loading or error states
  if (loadingLiveData) {
    return (
      <div className="absolute top-14 left-0 right-0 bottom-0 flex items-center justify-center text-gray-400">
        Loading dashboard data...
      </div>
    );
  }

  if (liveDataError) {
    return (
      <div className="absolute top-14 left-0 right-0 bottom-0 flex items-center justify-center text-red-500">
        {liveDataError}
      </div>
    );
  }

  // Validate chartsData
  if (!Array.isArray(chartsData) || chartsData.length < 4) {
    console.error("Invalid chartsData: Expected at least 4 charts, got:", chartsData);
    return (
      <div className="absolute top-14 left-0 right-0 bottom-0 flex items-center justify-center text-red-500">
        Error: Insufficient chart data
      </div>
    );
  }

  const handleBarClick = (attribute, chartIndex) => {
    console.log("handleBarClick:", { chartIndex, attribute });
    const { drill_down_query, report_query } = chartsData[chartIndex] || {};

    if (!drill_down_query) {
      console.error(`No drill_down_query for chart ${chartIndex}`);
      if (report_query) {
        console.log("Redirecting to report page with report_query:", report_query);
        navigate(`/client/NCR1/report/${chartIndex}`, { state: { reportData: report_query } });
      } else {
        console.error("No report_query found for chart:", chartIndex);
      }
      return;
    }

    const errorResponse = drill_down_query?.error;
    if (errorResponse === "query_obj for key 'drill_down_query' is None") {
      console.error(`Error: Drilldown data missing for chart ${chartIndex}. Redirecting to ReportPage.`);
      if (report_query) {
        console.log("Redirecting to report page with report_query:", report_query);
        navigate(`/client/NCR1/report/${chartIndex}`, { state: { reportData: report_query } });
      } else {
        console.error("No report_query found for chart:", chartIndex);
      }
    } else {
      console.log("Navigating to drilldown with drill_down_query:", drill_down_query);
      navigate(`/client/NCR1/drilldown/${chartIndex}`, { state: { drillDownData: drill_down_query } });
    }
  };

  return (
    <div className="bg-[#33414C] text-white">
      <div className="h-full p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-4">NCR-1 Dashboard</h1>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {/* Charts 1 & 2 (Recorder and Camera Status) */}
          {chartsData.slice(0, 2).map((chart, index) => {
            const { overview_query } = chart;
            const { data, legends } = overview_query || {};
            const labels = legends || [];
            const dataPoints = labels.map((label) => data?.find((item) => item.attribute === label)?.count || 0);
            const colors = labels.map((label) => colorMapping[label] || defaultColor);

            return (
              <div key={`chart-${index}`} className="bg-[#3f505d] rounded-lg shadow-md h-[300px] w-[724px]">
                <Chart
                  labels={labels}
                  dataPoints={dataPoints}
                  title={chart?.overview_query?.chart_name || `Chart ${index + 1}`}
                  colors={colors}
                  onBarClick={(attribute) => handleBarClick(attribute, index)}
                  showValues={true}
                />
              </div>
            );
          })}
        
          {/* Charts 3 & 4 (ACS and Flap Barrier) */}
          {chartsData.slice(2, 4).map((chart, index) => {
            const actualIndex = index + 2;
            const { overview_query } = chart;
            const { data, legends } = overview_query || {};
            const labels = legends || [];
            const dataPoints = labels.map((label) => data?.find((item) => item.attribute === label)?.count || 0);
            const colors = labels.map((label) => colorMapping[label] || defaultColor);

            return (
              <div key={`chart-${actualIndex}`} className="bg-[#3f505d] rounded-lg shadow-md h-[300px] w-[724px]">
                <Chart
                  labels={labels}
                  dataPoints={dataPoints}
                  title={chart?.overview_query?.chart_name || `Chart ${actualIndex + 1}`}
                  colors={colors}
                  onBarClick={(attribute) => handleBarClick(attribute, actualIndex)}
                  showValues={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NCR1_OverviewPage;