import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NCR2Context } from "../../../context/NCR2Context";
import Chart from "../../../components/Chart";
import { csv } from "d3-fetch";

const NCR2_OverviewPage = () => {
  // Live data context
  // Safely access context with fallback values
  const contextValue = useContext(NCR2Context);
  const { chartsData = [], loading: loading = false, error: error = null } = contextValue;
  const navigate = useNavigate();
  
  // CSV data state
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvError, setCsvError] = useState(null);
  
  // Color mappings
  const colorMapping = {
    Total: "#00b0f0",
    Online: "#00b050",
    Offline: "#ff0000",
  };
  const defaultColor = "#808080";
  const COLORS = ["#00b0f0", "#00b050", "#ff0000"];
  
  // CSV file path
  const csvFilePath = "/csvData/Sec_NCR2.csv";

  // Fetch CSV data
  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        const fetchedData = await csv(csvFilePath);
        const processedData = fetchedData.map((row) => ({
          name: row["NCR2"],
          total: parseInt(row["Total"], 10) || 0,
          online: parseInt(row["Online"], 10) || 0,
          offline: parseInt(row["Offline"], 10) || 0,
        }));
        setCsvData(processedData);
        setCsvLoading(false);
      } catch (error) {
        console.error("Error loading CSV file:", error);
        setCsvError("Failed to load CSV data");
        setCsvLoading(false);
      }
    };

    fetchCsvData();
  }, []);

  // Log live chart data when available
  useEffect(() => {
    console.log("Live Chart Data:", chartsData);
  }, [chartsData]);

  // Handle drill-down navigation for live charts
  const handleBarClick = (attribute, chartIndex) => {
    const { drill_down_query, report_query } = chartsData[chartIndex] || {};
    const errorResponse = drill_down_query?.error;

    if (errorResponse === "query_obj for key 'drill_down_query' is None") {
      console.error(`Error: Drilldown data missing for chart ${chartIndex}. Redirecting to ReportPage.`);
      if (report_query) {
        navigate(`/client/NCR2/report/${chartIndex}`, { state: { reportData: report_query } });
      } else {
        console.error("No report query found for this chart.");
      }
    } else {
      navigate(`/client/NCR2/drilldown/${chartIndex}`, { state: { drillDownData: drill_down_query } });
    }
  };

  // Helper function to get chart name
  const getChartName = (chart) => {
    return chart.overview_query?.chart_name || chart.drill_down_query?.chart_name || chart.report_query?.chart_name || "Unnamed Chart";
  };

  // Display loading state if either data source is still loading
  if (loading || csvLoading) {
    return <div className="h-screen flex items-center justify-center text-gray-400">Loading dashboard data...</div>;
  }

  // Display error if either data source has an error
  if (error || csvError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error || csvError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-bold text-center">NCR-2 Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {/* Live Data Charts - First 2 */}
          {chartsData.slice(0, 2).map((chart, index) => {
            const { overview_query } = chart;
            const { data, legends } = overview_query;
            const labels = legends;
            const dataPoints = labels.map(label => data.find(item => item.attribute === label)?.count || 0);
            const colors = labels.map(label => colorMapping[label] || defaultColor);

            return (
              <div key={`live-${index}`} className="bg-[#3f505d] rounded-lg shadow-md h-[300px] w-[724px]">
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

          {/* CSV Data Charts - First 2 */}
          {csvData.map((item, index) => (
            <div key={`csv-${index}`} className="bg-[#3f505d] rounded-lg shadow-md h-[300px] w-[724px]">
              <Chart
                labels={["Total", "Online", "Offline"]}
                dataPoints={[item.total, item.online, item.offline]}
                title={item.name}
                colors={COLORS}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NCR2_OverviewPage;