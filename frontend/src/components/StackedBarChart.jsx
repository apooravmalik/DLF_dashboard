import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PropTypes from "prop-types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const StackedBarChart = ({ labels, dataPoints, title, colors, onBarClick, showValues }) => {
  if (!labels || !dataPoints || dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Error: Missing or incorrect chart data
      </div>
    );
  }

  // Dynamically create dataset objects
  const barData = {
    labels,
    datasets: dataPoints.map((point, index) => ({
      label: `Dataset ${index + 1}`,
      data: point,
      backgroundColor: colors[index] || `hsl(${(index * 60) % 360}, 70%, 50%)`,
      borderColor: colors[index] || `hsl(${(index * 60) % 360}, 70%, 40%)`,
      borderWidth: 1,
      stack: "totalStack",
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom container size
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
      datalabels: {
        display: showValues,
        align: "top",
        color: "white",
      },
      legend: {
        position: "top",
        labels: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        categoryPercentage: 0.8, // Space between bars
        barPercentage: 0.8, // Adjust bar width
      },
      y: {
        stacked: true,
        ticks: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "#424242",
        },
      },
    },
    elements: {
      bar: {
        barThickness: 40, // Fixed bar width
        maxBarThickness: 50, // Max bar width
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const barIndex = elements[0].index;
        const label = labels[barIndex];
        if (onBarClick) {
          onBarClick(label);
        }
      }
    },
  };

  return (
    <div className="w-full h-[25rem] flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <Bar data={barData} options={options} />
    </div>
  );
};

StackedBarChart.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
  onBarClick: PropTypes.func.isRequired,
  showValues: PropTypes.bool.isRequired,
};

export default StackedBarChart;
