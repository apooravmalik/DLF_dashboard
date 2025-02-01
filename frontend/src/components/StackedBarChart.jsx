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
      backgroundColor: colors[index] || `hsl(${(index * 60) % 360}, 70%, 50%)`, // Unique color per dataset
      borderColor: colors[index] || `hsl(${(index * 60) % 360}, 70%, 40%)`,
      borderWidth: 1,
      stack: "totalStack",
    })),
  };

  const options = {
    responsive: true,
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
    scales: {
      x: { stacked: true },
      y: { stacked: true },
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
    <div className="flex flex-col items-center">
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
