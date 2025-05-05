import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';
import PropTypes from 'prop-types';
import DoubleBarChart from '../../../components/DoubleBarChart';

// Color constants
const COLORS = {
  NCR1: {
    weekBefore: '#4B89DC', // Blue
    lastWeek: '#FF6B6B'    // Red/Orange
  },
  ROI: {
    weekBefore: '#4B89DC', // Blue
    lastWeek: '#2ECC71'    // Green
  },
  MALLS: {
    weekBefore: '#4B89DC', // Blue
    lastWeek: '#F39C12'    // Orange
  },
  NCR2: {
    weekBefore: '#4B89DC', // Blue
    lastWeek: '#5DADE2'    // Light Blue
  }
};

const Legend = ({ colors }) => (
  <div className="flex justify-center space-x-6 mb-1">
    <div className="flex items-center">
      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: colors[1] }}></div>
      <span className="text-sm text-white">Last 7 Days</span>
    </div>
    <div className="flex items-center">
      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: colors[0] }}></div>
      <span className="text-sm text-white">Week Before Last</span>
    </div>
  </div>
);

const FLS_OverviewPage = () => {
  const [data, setData] = useState({ malls: [], ncr01: [], ncr02: [], roi: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [malls, ncr01, ncr02, roi] = await Promise.all([
          csv('/csvData/Malls.csv'),
          csv('/csvData/NCR01.csv'),
          csv('/csvData/NCR02.csv'),
          csv('/csvData/ROI.csv'),
        ]);
        setData({ malls, ncr01, ncr02, roi });
      } catch (error) {
        console.error('Error loading CSV files:', error);
      }
    };

    fetchData();
  }, []);

  const getChartColors = (chartType) => {
    switch (chartType) {
      case 'NCR-1':
        return [COLORS.NCR1.weekBefore, COLORS.NCR1.lastWeek];
      case 'ROI':
        return [COLORS.ROI.weekBefore, COLORS.ROI.lastWeek];
      case 'Malls':
        return [COLORS.MALLS.weekBefore, COLORS.MALLS.lastWeek];
      case 'NCR-2':
        return [COLORS.NCR2.weekBefore, COLORS.NCR2.lastWeek];
      default:
        return ['#4B89DC', '#1976D2'];
    }
  };

  const renderChart = (title, chartData) => {
    const colors = getChartColors(title);
    return (
      // min-h-[400px] chnages the container size
      <div className="bg-[#3f505d] rounded-lg p-2 shadow-md">
        {/* <h2 className="text-lg font-semibold text-center mb-2 text-white">{title}</h2> */}
        <Legend colors={colors} />
        {/* change chart sizing here, make sure it fits in the container, change lg: w-[]*/}
        <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] p-2">
          <DoubleBarChart
            labels={chartData.map((row) => row['Site'])}
            dataPoints={[
              chartData.map((row) => parseFloat(row['Week Before Last (%)'])),
              chartData.map((row) => parseFloat(row['Last 7 Days (%)'])),
            ]}
            title={title}
            colors={colors}
            isStacked={true}
            showValues={true}
            options={{
              plugins: {
                legend: {
                  display: false // Hide default Chart.js legend since we're using a custom legend
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#33414C] text-white ">
      <h1 className="text-2xl font-bold text-center">Fire System Equipment Up Time Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {renderChart('NCR-1', data.ncr01)}
        {renderChart('ROI', data.roi)}
        {renderChart('Malls', data.malls)}
        {renderChart('NCR-2', data.ncr02)}
      </div>
    </div>
  );
};

export default FLS_OverviewPage;

Legend.propTypes = {
  colors: PropTypes.array.isRequired,
};
