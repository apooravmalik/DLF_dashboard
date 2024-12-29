import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart = ({ labels, dataPoints, title, colors }) => {
  if (!labels || !dataPoints) {
    return <div className="flex items-center justify-center h-full text-gray-400">Error: Missing chart data</div>;
  }

  const defaultColor = '#808080'; // Default gray color for missing entries

  // Create a mapping of labels to colors
  const labelColorMapping = labels.reduce((acc, label, index) => {
    acc[label] = colors[index] || defaultColor;
    return acc;
  }, {});

  // Ensure colors align with labels
  const orderedColors = labels.map(label => labelColorMapping[label] || defaultColor);

  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: dataPoints,
        backgroundColor: orderedColors, // Use matched colors
        borderColor: orderedColors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // This ensures the chart will resize based on container dimensions
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E2E8F0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#F7FAFC',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#F7FAFC',
        bodyColor: '#E2E8F0',
        borderColor: '#4B5563',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#E2E8F0',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#E2E8F0',
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="h-full w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

Chart.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  colors: PropTypes.array,
};

Chart.defaultProps = {
  colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
};

export default Chart;
