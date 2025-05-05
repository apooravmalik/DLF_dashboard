import PropTypes from "prop-types";
import { useState, useMemo } from "react";

const Table = ({ columns, data, rowsPerPage = 16, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    "Building Name": initialFilters["Building Name"] || "",
    "Status": initialFilters["Status"] || "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique values for filterable columns
  const uniqueValues = useMemo(() => {
    const values = { "Building Name": new Set(), "Status": new Set() };
    data.forEach((row) => {
      if (row.Status) values.Status.add(row.Status);
      if (row["Building Name"]) values["Building Name"].add(row["Building Name"]);
    });
    return {
      Status: [...values.Status],
      "Building Name": [...values["Building Name"]],
    };
  }, [data]);

  // Apply filters to the data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        (filters["Status"] === "" || row["Status"] === filters["Status"]) &&
        (filters["Building Name"] === "" || row["Building Name"] === filters["Building Name"])
      );
    });
  }, [data, filters]);
  
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset pagination when filtering
  };

  // Generate column widths based on content type
  const getColumnWidth = (column) => {
    if (column === "S.No.") return "w-16";
    if (column === "Status") return "w-32";
    if (column === "Down Time (hours)") return "w-40";
    if (column === "IP Detail") return "w-32";
    if (column === "Device Name" || column === "Building Name") return "w-48";
    return ""; // default width
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="w-full overflow-x-auto">
        <div className="w-full flex-none">
          <table className="w-full table-fixed bg-[#3E4B57] text-white border border-[#4A5A68]">
            <thead>
              <tr className="bg-[#2C3945] font-bold text-white">
                <td className="px-4 py-2 border border-[#4A5A68]" colSpan={columns.length + 1}>
                  Total Rows: {filteredData.length}
                </td>
              </tr>
              <tr className="bg-[#25323E] text-gray-300">
                <th className={`px-4 py-2 border border-[#4A5A68] w-16`}>S.No.</th>
                {columns.map((column) => (
                  <th key={column} className={`px-4 py-2 border border-[#4A5A68] ${getColumnWidth(column)}`}>
                    <div className="flex flex-col items-center">
                      <span>{column}</span>
                      {["Status", "Building Name"].includes(column) &&
                        uniqueValues[column]?.length > 0 && (
                          <select
                            value={filters[column] || ""}
                            onChange={(e) => handleFilterChange(column, e.target.value)}
                            className="mt-1 bg-[#2C3945] text-white border border-[#4A5A68] px-2 py-1 rounded text-sm w-full"
                          >
                            <option value="">All</option>
                            {uniqueValues[column].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="overflow-y-auto">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? "bg-[#3A4855]" : "bg-[#313D48]"} hover:bg-[#4A5A68] transition-colors`}>
                    <td className="px-4 py-2 border border-[#4A5A68] w-16 truncate">
                      {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                    </td>
                    {columns.map((column) => (
                      <td key={column} className={`px-4 py-2 border border-[#4A5A68] ${getColumnWidth(column)} truncate`}>
                        {row[column] || "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-2 text-center border border-[#4A5A68]" colSpan={columns.length + 1}>
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed pagination controls at bottom */}
      <div className="flex-none flex justify-between items-center mt-2 bg-[#3E4B57] py-2 px-4 border border-[#4A5A68]">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-[#2C3945] hover:bg-[#4A5A68]"}`}
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-500 cursor-not-allowed" : "bg-[#2C3945] hover:bg-[#4A5A68]"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  rowsPerPage: PropTypes.number,
  initialFilters: PropTypes.object,
};

export default Table;