import { useLocation } from "react-router-dom";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";

const ClientReport = () => {
  const { state } = useLocation();
  const { reportData, label } = state || {}; // Extract the report query data
  console.log("Report Data Received in ClientReport:", reportData);
  console.log("Label Received:", label);
  const [formattedData, setFormattedData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (reportData?.data) {
      // Process data into tabular format
      const tempFormattedData = [];
      const tempColumns = new Set();

      let row = {};
      reportData.data.forEach((item, index) => {
        const { attribute, count } = item;

        if (!tempColumns.has(attribute)) {
          tempColumns.add(attribute);
        }

        row[attribute] = count || "-";

        // Move to the next row if we've encountered all attributes for this item
        if (
          index === reportData.data.length - 1 ||
          reportData.data[index + 1]?.attribute === reportData.data[0]?.attribute
        ) {
          tempFormattedData.push(row);
          row = {};
        }
      });

      setColumns(Array.from(tempColumns));
      setFormattedData(tempFormattedData);
      console.log("Formatted Data for Table:", tempFormattedData);
    }
  }, [reportData]);

  const handleDownloadClick = () => {
    // Handle the download logic here when API is connected
    console.log("Download Report button clicked!");
  };

  if (!reportData || !reportData.data) {
    return (
      <div className="h-[calc(100vh-82px)] flex items-center justify-center">
        <div className="text-red-500">No report data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">
          Client Report for {reportData.title || "Selected Attribute"}
        </h1>
        <button
          onClick={handleDownloadClick}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Download Report
        </button>
      </div>
      <Table columns={columns} data={formattedData} />
    </div>
  );
};

export default ClientReport;
