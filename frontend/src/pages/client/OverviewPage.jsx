import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Chart from "../../components/Chart";

const OverviewPage = () => {
  const { chartsData, loading, error } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Chart Data:", chartsData);
  }, [chartsData]);

  const colorMapping = {
    Total: "#2196F3",
    Online: "#4CAF50",
    Offline: "#F44336",
  };

  const defaultColor = "#808080";

  const handleBarClick = (attribute, chartIndex) => {
    const { drill_down_query, report_query } = chartsData[chartIndex] || {};

    if (drill_down_query) {
      navigate(`/client/drilldown/${chartIndex}`, { state: { drillDownData: drill_down_query } });
    } else {
      navigate(`/client/report/${chartIndex}`, { state: { reportData: report_query } });
    }
  };

  const getChartName = (chart) => {
    if (chart.overview_query) return chart.overview_query.chart_name;
    if (chart.drill_down_query) return chart.drill_down_query.chart_name;
    if (chart.report_query) return chart.report_query.chart_name;
    return "Unnamed Chart";
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-gray-400">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 px-4 pt-3">
          {chartsData.map((chart, index) => {
            const { overview_query } = chart;
            const { data, legends } = overview_query;

            const labels = legends;
            const dataPoints = labels.map(label =>
              data.find(item => item.attribute === label)?.count || 0
            );

            const colors = labels.map(
              label => colorMapping[label] || defaultColor
            );

            return (
              <div key={index} className="bg-gray-800 rounded-lg shadow-md">
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

export default OverviewPage;
