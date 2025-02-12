import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RJOCLiveContext } from "../../../context/RJOCLiveContext";
import Chart from "../../../components/Chart";

const RJOCLive_OverviewPage = () => {
  const { chartsData, loading, error } = useContext(RJOCLiveContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Chart Data:", chartsData);
  }, [chartsData]);

  const colorMapping = {
    Total: "#00b0f0",
    Online: "#00b050",
    Offline: "#ff0000",
  };

  const defaultColor = "#808080";

  const handleBarClick = (attribute, chartIndex) => {
    const { drill_down_query, report_query } = chartsData[chartIndex] || {};
    const errorResponse = drill_down_query?.error;

    if (errorResponse === "query_obj for key 'drill_down_query' is None") {
      console.error(`Error: Drilldown data missing for chart ${chartIndex}. Redirecting to ReportPage.`);
      if (report_query) {
        navigate(`/client/rjoclive/report/${chartIndex}`, { state: { reportData: report_query } });
      } else {
        console.error("No report query found for this chart.");
      }
    } else {
      navigate(`/client/rjoclive/drilldown/${chartIndex}`, { state: { drillDownData: drill_down_query } });
    }
  };

  const getChartName = (chart) => {
    return chart.overview_query?.chart_name || chart.drill_down_query?.chart_name || chart.report_query?.chart_name || "Unnamed Chart";
  };

  if (loading) {
    return <div className="h-[calc(100vh-82px)] flex items-center justify-center text-gray-400">Loading data...</div>;
  }

  if (error) {
    return <div className="h-[calc(100vh-82px)] flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 px-4 pt-3">
          {chartsData.map((chart, index) => {
            const { overview_query } = chart;
            const { data, legends } = overview_query;
            const labels = legends;
            const dataPoints = labels.map(label => data.find(item => item.attribute === label)?.count || 0);
            const colors = labels.map(label => colorMapping[label] || defaultColor);

            return (
              <div key={index} className="bg-[#3f505d] rounded-lg shadow-md">
                <Chart
                  labels={labels}
                  dataPoints={dataPoints}
                  title={getChartName(chart)}
                  colors={colors}
                  onBarClick={(attribute) => handleBarClick(attribute, index)}
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

export default RJOCLive_OverviewPage;
