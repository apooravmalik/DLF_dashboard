import { useEffect, useState } from "react";
import { csv } from "d3-fetch";
import BigBarChart from "../../../components/BigBarChart"; // Import your Chart component

const Malls_OverviewPage = () => {
  const [data, setData] = useState([]);
  const COLORS = ["#00b0f0", "#00b050", "#ff0000"]; // Blue for Total, Green for Online, Red for Offline
  const csvFilePath = "/csvData/Sec_Malls.csv"; // Filepath for the CSV file

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await csv(csvFilePath); //CSV File path Addition here
        const processedData = csvData.map((row) => ({
          name: row["Malls"], //rows mapping
          total: parseInt(row["Total"], 10) || 0,
          online: parseInt(row["Online"], 10) || 0,
          offline: parseInt(row["Offline"], 10) || 0,
        }));
        setData(processedData);
      } catch (error) {
        console.error("Error loading CSV file:", error);
      }
    };

    fetchData();
  }, []);

  return (
    // Container for chart with updated background color
    <div className="min-h-screen bg-[#33414C] text-white">
      <h1 className="text-2xl font-bold text-center ">Malls Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="bg-[#3f505d] rounded-lg p-4 shadow-md">
            <BigBarChart
              labels={["Total", "Online", "Offline"]}
              dataPoints={[item.total, item.online, item.offline]}
              title={item.name}
              colors={COLORS}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Malls_OverviewPage;