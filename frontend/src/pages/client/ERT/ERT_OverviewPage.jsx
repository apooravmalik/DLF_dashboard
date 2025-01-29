import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch'; // Import d3-fetch
import Chart from '../../../components/Chart';
import DoubleBarChart from '../../../components/DoubleBarChart';

const ERT_OverviewPage = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and parse the CSV file
        const data = await csv('/csvData/ERT.csv');

        console.log('CSV Data:', data); // Debug CSV structure

        // Extract labels (ERT teams)
        const labels = data.map((row) => row['ERT']);

        // Buildings to visualize
        const buildings = ['Building 8', 'Building 10', 'Gateway Tower'];

        // Define colors for each building
        const colors = {
          'Building 8': '#4CAF50', // Green
          'Building 10': '#2196F3', // Blue
          'Gateway Tower': '#FF6384', // Pink
        };

        // Create datasets
        const datasets = buildings.map((building) => ({
          label: building,
          data: data.map((row) => parseInt(row[building], 10) || 0), // Convert values to numbers
          backgroundColor: colors[building], // Assign corresponding color
        }));

        setChartData({ labels, datasets });
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) {
    return <div className="text-gray-400 text-center mt-10">Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold text-center pt-4">ERT Dashboard</h1>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-6">
        
        {/* Stacked Bar Chart for all buildings with Legend */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-md">
          {/* Legend Section */}
          <div className="flex justify-center space-x-6 mb-4">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: dataset.backgroundColor }}></span>
                <span className="text-sm">{dataset.label}</span>
              </div>
            ))}
          </div>

          <DoubleBarChart
            labels={chartData.labels}
            dataPoints={chartData.datasets.map((ds) => ds.data)}
            title="ERT Teams Across Buildings"
            colors={chartData.datasets.map((ds) => ds.backgroundColor)}
            isStacked={true}
            onBarClick={(label) => console.log(`Clicked: ${label}`)}
            showValues={true}
            drillDownData={{}}
          />
        </div>

        {/* Individual Bar Charts for each building */}
        {chartData.datasets.map((dataset, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-md">
            <Chart
              labels={chartData.labels}
              dataPoints={dataset.data}
              title={dataset.label}
              colors={Array(dataset.data.length).fill(dataset.backgroundColor)} // Ensure all bars have the same color
              onBarClick={(label) => console.log(`Clicked: ${label}`)}
              showValues={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ERT_OverviewPage;
