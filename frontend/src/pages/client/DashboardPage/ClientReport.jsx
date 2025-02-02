/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import axios from 'axios'; // Make sure to install axios if not already installed
import config from "../../../config/config";

const ClientReport = () => {
  const { state } = useLocation();
  const { reportData, label } = state || {}; 
  const [formattedData, setFormattedData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
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
      setFormattedData(tempFormattedData);
    }
  }, [reportData]);

  const handleDownloadClick = async () => {
    try {
      // Use formattedData directly for the download request
      const downloadData = {
        name: reportData.chart_name || "Report",
        data: formattedData
      };
  
      // Make the API call to download the report
      const response = await axios.post(`${config.API_BASE_URL}/api/report/download`, downloadData, {
        responseType: 'blob' // Important for file download
      });
  
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on report title or default
      const filename = `${reportData.chart_name || 'report'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error('Error downloading report:', error);
      // Log the full error for debugging
      console.error('Full error details:', error.response?.data);
      
      // More informative error handling
      alert(`Failed to download report: ${error.response?.data?.error || 'Unknown error'}`);
    }
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
          Client Report for {reportData.chart_name || "Selected Attribute"}
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