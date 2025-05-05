/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import axios from "axios"; 
import config from "../../../config/config";

const NCR1_ClientReport = () => {
  const { state } = useLocation();
  const { reportData, label, chartIndex } = state || {};
  const status = state.status || "";
  console.log("Status", status);
  const [formattedData, setFormattedData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    console.log("report data:", reportData?.data);
    if (reportData?.data) {
      const tempFormattedData = [];
      const tempColumns = new Set();

      let row = {};
      reportData.data.forEach((item, index) => {
        const { attribute, count } = item;

        if (!tempColumns.has(attribute)) {
          tempColumns.add(attribute);
        }

        row[attribute] = count || "-";

        if (
          index === reportData.data.length - 1 ||
          reportData.data[index + 1]?.attribute === reportData.data[0]?.attribute
        ) {
          tempFormattedData.push(row);
          row = {};
        }
      });

      setColumns(Array.from(tempColumns));
      console.log("Columns:", Array.from(tempColumns))
      setFormattedData(tempFormattedData);
    }
  }, [reportData]);

  const handleDownloadClick = async () => {
    try {
      // Use formattedData directly for the download request
      const downloadData = {
        name: reportData.chart_name || "Report",
        data: formattedData,
      };

      // Make the API call to download the report
      const response = await axios.post(
        `${config.API_BASE_URL}/api/report/download`,
        downloadData,
        {
          responseType: "blob", // Important for file download
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename based on report title or default
      const filename = `${reportData.chart_name || "report"}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      // Log the full error for debugging
      console.error("Full error details:", error.response?.data);

      // More informative error handling
      alert(
        `Failed to download report: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    }
  };

  if (!reportData || !reportData.data) {
    return (
      <div className="absolute top-14 left-0 right-0 bottom-0 flex items-center justify-center">
        <div className="text-red-500">No report data available</div>
      </div>
    );
  }

  return (
    // Position absolute from below the navbar to take up full remaining space
    <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col overflow-hidden bg-[#33414C]">
      {/* Header with title and download button - fixed at top */}
      <div className="flex justify-between items-center p-4 bg-[#25323E] text-white">
        <h1 className="text-lg font-bold">
          {{
            "0": "Recorder Status Report",
            "1": "Camera Status Report",
            "2": "ACS Status Report",
            "3": "Flap barrier Status Report",
          }[chartIndex] || reportData?.chart_name || "Selected Attribute"}
        </h1>
        <button
          onClick={handleDownloadClick}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Download Report
        </button>
      </div>
      
      {/* Table container that takes remaining height */}
      <div className="flex-grow overflow-hidden">
        <Table
          columns={columns}
          data={formattedData}
          initialFilters={{
            "Building Name": label || "",
            "Status": status || "",
          }}
        />
      </div>
    </div>
  );
};

export default NCR1_ClientReport;