/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../../../config/config";

const RJOCLive_ReportPage = () => {
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
        tempColumns.add(item.attribute);
        row[item.attribute] = item.count || "-";

        if (index === reportData.data.length - 1 || reportData.data[index + 1]?.attribute === reportData.data[0]?.attribute) {
          tempFormattedData.push(row);
          row = {};
        }
      });

      setColumns(Array.from(tempColumns));
      setFormattedData(tempFormattedData);
    }
  }, [reportData]);

  if (!reportData?.data) {
    return <div className="h-[calc(100vh-82px)] flex items-center justify-center text-red-500">No report data available</div>;
  }

  return (
    <div className="min-h-screen bg-[#33414C] text-white px-4 pt-3">
      <h1 className="text-lg font-bold mb-4">Client Report for {reportData.chart_name || "Selected Attribute"}</h1>
      <Table columns={columns} data={formattedData} />
    </div>
  );
};

export default RJOCLive_ReportPage;
