import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';
import Chart from '../../../components/Chart';
import DoubleBarChart from '../../../components/DoubleBarChart';

const ERT_OverviewPage = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CSV data from the specified path
        const data = await csv('/csvData/ERT.csv');
        console.log('CSV Data:', data);

        // Extracting labels for X-axis (ERT values)
        const labels = data.map((row) => row['ERT']);

        // Define the buildings for which data is available
        const buildings = ['Building 8', 'Building 10', 'Gateway Tower'];

        // Define colors for different buildings (modify these to change chart colors)
        const colors = {
          'Building 8': '#00b0f0', // Cyan Blue
          'Building 10': '#2196F3', // Bright Blue
          'Gateway Tower': '#FF6384', // Pink
        };

        // Preparing dataset for the charts
        const datasets = buildings.map((building) => ({
          label: building, // Legend label
          data: data.map((row) => parseInt(row[building], 10) || 0), // Extract numerical data
          backgroundColor: colors[building], // Assign corresponding color
        }));

        setChartData({ labels, datasets }); // Update state with formatted data
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    fetchData();
  }, []);

  // Display a loading message while data is being fetched
  if (!chartData) {
    return <div className="text-gray-400 text-center mt-10">Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#33414C] text-white">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-center">ERT Dashboard</h1>

      {/* 2x2 Grid Layout for displaying charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap">
        
        {/* Stacked Bar Chart for all buildings with a Legend */}
        <div className="bg-[#3f505d] rounded-lg p-2 shadow-md">
          {/* Chart Title (Modify as needed) */}
          {/* <h2 className="text-lg font-semibold text-center mb-3">Team Distribution</h2> */}

          {/* Legend Section - Modify colors above in the `colors` object to change legend colors */}
          <div className="flex justify-center space-x-6 mb-4">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center space-x-2">
                {/* Color Indicator for the legend */}
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: dataset.backgroundColor }}></span>
                <span className="text-sm">{dataset.label}</span>
              </div>
            ))}
          </div>

          {/* Chart Container - Modify `w-[]` and `h-[]` values to resize */}
          <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] p-2">
            <DoubleBarChart
              labels={chartData.labels} // X-axis labels
              dataPoints={chartData.datasets.map((ds) => ds.data)} // Data for stacked bars
              title="ERT Teams Across Buildings" // Chart Title - Modify this to change title
              colors={chartData.datasets.map((ds) => ds.backgroundColor)} // Assign colors
              isStacked={true} // Enable stacked bar chart
              onBarClick={(label) => console.log(`Clicked: ${label}`)} // Click event
              showValues={true} // Show values on bars
              drillDownData={{}} // Placeholder for drill-down functionality
            />
          </div>
        </div>

        {/* Individual Bar Charts for each building */}
        {chartData.datasets.map((dataset, index) => (
          <div key={index} className="bg-[#3f505d] rounded-lg p-4 shadow-md max-h-[500px]">
            {/* Individual Chart Title (Modify for each building) */}
            {/* <h2 className="text-lg font-semibold text-center mb-3">{dataset.label}</h2> */}

            {/* Chart Container - Modify `w-[]` and `h-[]` values to resize */}
            <div className="w-[300px] h-[200px] md:w-[400px] md:h-[250px] lg:w-[935px] lg:h-[501px] p-2 mx-auto">
              <Chart
                labels={chartData.labels} // X-axis labels
                dataPoints={dataset.data} // Data for this specific building
                title={dataset.label} // Chart Title - Modify for each building
                colors={Array(dataset.data.length).fill(dataset.backgroundColor)} // Assign colors
                onBarClick={(label) => console.log(`Clicked: ${label}`)} // Click event
                showValues={true} // Show values on bars
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ERT_OverviewPage;
