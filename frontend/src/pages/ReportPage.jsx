import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Table from "../components/Table"; // Assuming you have a Table component
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

// Color map for name to RGBA conversion
const colorMap = {
  Blue: "rgba(0, 0, 255, 0.6)",
  Green: "rgba(0, 255, 0, 0.6)",
  Red: "rgba(255, 0, 0, 0.6)",
};

const ReportPage = () => {
  const { queries, setChartData } = useContext(AppContext);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [colorSelections, setColorSelections] = useState({}); // Store color selections
  const [chartTitles, setChartTitles] = useState([]); // Store chart titles
  const [selectedTables, setSelectedTables] = useState([]); // Store selected tables for chart creation
  const [selectedChartsData, setSelectedChartsData] = useState([]); // Store generated chart data

  // Handle checkbox selection logic
  const handleAttributeSelection = (index, attribute) => {
    const updatedAttributes = [...selectedAttributes];
    const selectedSet = updatedAttributes[index] || new Set();

    if (selectedSet.has(attribute)) {
      selectedSet.delete(attribute); // Deselect if already selected
    } else {
      selectedSet.add(attribute); // Select if not selected
    }

    updatedAttributes[index] = selectedSet; // Update the selected set for the corresponding query
    setSelectedAttributes(updatedAttributes); // Update state with new selection
  };

  // Handle color selection change for each attribute
  const handleColorChange = (index, attribute, color) => {
    const newColorSelections = { ...colorSelections };
    if (color) {
      // Store the RGBA value for selected color
      newColorSelections[`${index}-${attribute}`] = colorMap[color] || ""; // Use color map for conversion
    } else {
      // If no color is selected, remove the color selection for the attribute
      delete newColorSelections[`${index}-${attribute}`];
    }
    setColorSelections(newColorSelections); // Update the color state
  };

  // Handle title input change for each chart
  const handleTitleChange = (index, newTitle) => {
    const updatedTitles = [...chartTitles];
    updatedTitles[index] = newTitle; // Update title for the selected chart
    setChartTitles(updatedTitles); // Update chart titles state
  };

  // Handle table selection (checkboxes to select tables for charts)
  const handleTableSelection = (index) => {
    const updatedTables = [...selectedTables];
    if (updatedTables.includes(index)) {
      updatedTables.splice(updatedTables.indexOf(index), 1); // Remove from selected tables
    } else {
      updatedTables.push(index); // Add to selected tables
    }
    setSelectedTables(updatedTables); // Update selected tables state
  };

  // Handle "Generate Selected Charts" button click
  const generateSelectedCharts = () => {
    const selectedChartsData = queries.map((query, index) => {
      if (!selectedTables.includes(index)) return null; // Skip charts for unselected tables

      const selectedData = query.data[0].filter((item) =>
        selectedAttributes[index]?.has(item.attribute) // Filter based on selection
      );

      // Ensure the correct colors (RGBA values) are applied
      const colors = selectedData.map((item) => {
        const color = colorSelections[`${index}-${item.attribute}`];
        return color || null; // Use null if no color is selected
      });

      return {
        title: chartTitles[index] || `Chart ${index + 1}`, // Use custom title or default
        labels: selectedData.map((item) => item.attribute),
        dataPoints: selectedData.map((item) => item.count),
        colors: colors, // Ensure colors are applied here
      };
    }).filter((data) => data !== null); // Remove null entries from skipped tables

    console.log("Generated Chart Data:", selectedChartsData);
    setSelectedChartsData(selectedChartsData); // Save generated chart data in state
    setChartData(selectedChartsData); // Set the data in the context
  };

  return (
    <div className="h-screen flex flex-col items-center bg-[#18181B] text-white">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-xl font-bold mb-4">Reports</h1>

        {/* Loop through queries and render tables */}
        {queries.map((queryResult, index) => (
          <div key={uuidv4()} className="mb-8">
            {queryResult.data && queryResult.data[0] && queryResult.data[0].length > 0 ? (
              <div>
                {/* Table with checkboxes for attribute selection */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#2196F3] rounded focus:ring-[#1976D2]"
                    checked={selectedTables.includes(index)} // Check if table is selected
                    onChange={() => handleTableSelection(index)} // Toggle table selection
                  />
                  <span className="ml-2">Select for Chart</span>
                </div>

                {/* Title input box */}
                <div className="mb-4">
                  <label htmlFor={`chartTitle-${index}`} className="block mb-2 text-sm font-medium text-gray-300">
                    Chart Title:
                  </label>
                  <input
                    type="text"
                    id={`chartTitle-${index}`}
                    value={chartTitles[index] || ""} // Make sure value is controlled
                    onChange={(e) => handleTitleChange(index, e.target.value)} // Update title on change
                    placeholder="Enter chart title"
                    className="px-4 py-2 bg-gray-700 text-white rounded"
                  />
                </div>

                {/* Table with color dropdown */}
                <Table
                  columns={Object.keys(queryResult.data[0][0] || {})}
                  data={queryResult.data[0]}
                  renderCheckboxes
                  onCheckboxChange={(attribute) => handleAttributeSelection(index, attribute)}
                  selectedAttributes={selectedAttributes[index] || new Set()}
                  handleColorChange={handleColorChange} // Pass the color change handler
                  colorSelections={colorSelections} // Pass the selected colors
                />
              </div>
            ) : (
              <p>No data available for this query.</p>
            )}
          </div>
        ))}

        {/* Button to generate selected charts */}
        <Link
          to={{
            pathname: "/dashboard",
            state: { chartData: selectedChartsData }, // Passing the chart data to DashboardPage
          }}
        >
          <button
            className="px-6 py-3 bg-[#2196F3] text-white rounded"
            onClick={generateSelectedCharts}
          >
            Generate Selected Charts
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ReportPage;
