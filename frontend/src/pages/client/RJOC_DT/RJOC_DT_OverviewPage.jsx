import { useEffect, useState } from "react";
import { csv } from "d3-fetch";
import Chart from "../../../components/Chart"; // Import your Chart component

const RJOC_DT = () => {
  const [data, setData] = useState([]);
  const COLORS = ["#2196F3", "#4CAF50", "#F44336"]; // Blue for Total, Green for Online, Red for Offline
  const csvFilePath = "/csvData/RJOC_DT.csv"; // Filepath for the CSV file

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await csv(csvFilePath);
        const processedData = csvData.map((row) => ({
          name: row["RJOC_DT"],
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-6">RJOC DT Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-md">
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
  );
};

export default RJOC_DT;
