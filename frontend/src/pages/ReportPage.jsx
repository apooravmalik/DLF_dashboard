/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Table from "../components/Table";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

const colorMap = {
  Blue: "rgba(0, 0, 255, 0.6)",
  Green: "rgba(0, 255, 0, 0.6)",
  Red: "rgba(255, 0, 0, 0.6)",
};

const ReportPage = () => {
  const { queries, setChartData } = useContext(AppContext);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [colorSelections, setColorSelections] = useState({}); // Store array of colors per table
  const [chartTitles, setChartTitles] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);

  const handleAttributeSelection = (index, attribute) => {
    const updatedAttributes = [...selectedAttributes];
    const selectedSet = updatedAttributes[index] || new Set();

    if (selectedSet.has(attribute)) {
      selectedSet.delete(attribute);
    } else {
      selectedSet.add(attribute);
    }

    updatedAttributes[index] = selectedSet;
    setSelectedAttributes(updatedAttributes);
  };

  const handleColorChange = (tableIndex, attributeIndex, color) => {
    const updatedColors = {
      ...colorSelections,
      [tableIndex]: [...(colorSelections[tableIndex] || [])],
    };
    updatedColors[tableIndex][attributeIndex] = color;
    setColorSelections(updatedColors);
  };

  const handleTitleChange = (index, newTitle) => {
    const updatedTitles = [...chartTitles];
    updatedTitles[index] = newTitle;
    setChartTitles(updatedTitles);
  };

  const handleTableSelection = (index) => {
    const updatedTables = [...selectedTables];
    if (updatedTables.includes(index)) {
      updatedTables.splice(updatedTables.indexOf(index), 1);
    } else {
      updatedTables.push(index);
    }
    setSelectedTables(updatedTables);
  };

  const generateSelectedCharts = () => {
    const selectedChartsData = queries
      .map((query, tableIndex) => {
        if (!selectedTables.includes(tableIndex)) return null;

        const selectedData = query.data[0].filter((item) =>
          selectedAttributes[tableIndex]?.has(item.attribute)
        );

        const labels = selectedData.map((item) => item.attribute);
        const dataPoints = selectedData.map((item) => item.count);

        // Create isolated color mapping for each chart
        const attributeColorMap = {};
        selectedData.forEach((item, index) => {
          const selectedColor = colorSelections[tableIndex]?.[index];
          if (selectedColor) {
            attributeColorMap[item.attribute] = selectedColor;
          }
        });

        // Debug: Print attribute-color mapping for each chart
        console.log(
          `Table Index ${tableIndex} - Attribute Color Map:`,
          attributeColorMap
        );

        // Ensure all labels have a corresponding color
        const colors = labels.map((label) => {
          if (!attributeColorMap[label]) {
            // Retain previous color selection if available
            const previousColor = colorSelections[tableIndex]?.find(
              (color, idx) =>
                queries[tableIndex].data[0][idx]?.attribute === label
            );
            attributeColorMap[label] = previousColor || "Gray";
          }

          console.log(
            `Mapping Label: ${label} -> Color: ${attributeColorMap[label]}`
          );
          return attributeColorMap[label];
        });

        // Debug: Verify final chart data
        console.log(`Generated Chart Data for Table ${tableIndex}:`, {
          title: chartTitles[tableIndex] || `Chart ${tableIndex + 1}`,
          labels,
          dataPoints,
          colors,
        });

        return {
          title: chartTitles[tableIndex] || `Chart ${tableIndex + 1}`,
          labels,
          dataPoints,
          colors,
        };
      })
      .filter((data) => data !== null);

    console.log("Final Generated Charts:", selectedChartsData);
    setChartData(selectedChartsData);
  };

  return (
    <div className="h-screen flex flex-col items-center bg-[#18181B] text-white">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-xl font-bold mb-4">Reports</h1>

        {queries.map((queryResult, index) => (
          <div key={uuidv4()} className="mb-8">
            {queryResult.data && queryResult.data[0]?.length > 0 ? (
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#2196F3] rounded focus:ring-[#1976D2]"
                    checked={selectedTables.includes(index)}
                    onChange={() => handleTableSelection(index)}
                  />
                  <span className="ml-2">Select for Chart</span>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`chartTitle-${index}`}
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Chart Title:
                  </label>
                  <input
                    type="text"
                    id={`chartTitle-${index}`}
                    value={chartTitles[index] || ""}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    placeholder="Enter chart title"
                    className="px-4 py-2 bg-gray-700 text-white rounded"
                  />
                </div>
                <Table
                  columns={Object.keys(queryResult.data[0][0] || {})}
                  data={queryResult.data[0]}
                  onCheckboxChange={(attribute) =>
                    handleAttributeSelection(index, attribute)
                  }
                  selectedAttributes={selectedAttributes[index] || new Set()}
                  handleColorChange={(rowIndex, color) =>
                    handleColorChange(index, rowIndex, color)
                  }
                  colorSelections={colorSelections[index] || []}
                />
              </div>
            ) : (
              <p>No data available for this query.</p>
            )}
          </div>
        ))}

        <Link to="/dashboard">
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
