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
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const DoubleBarChart = ({ labels, dataPoints, title, colors, onBarClick, showValues, chartIndex }) => {
  const navigate = useNavigate(); // Hook to navigate to another page

  if (!labels || !dataPoints || dataPoints.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Error: Missing chart data or incorrect data format
      </div>
    );
  }

  const barData = {
    labels: labels,
    datasets: dataPoints.map((point, index) => ({
      label: `Dataset ${index + 1}`,
      data: point,
      backgroundColor: colors[index] || "#808080",
      borderColor: colors[index] || "#808080",
      borderWidth: 1,
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
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const barIndex = elements[0].index; // Get the index of the clicked bar
        const label = labels[barIndex]; // Get the corresponding label
        onBarClick(label); // Trigger the `onBarClick` callback
        navigate(`/client/report/${chartIndex}`); // Redirect dynamically to the correct report page
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

DoubleBarChart.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
  onBarClick: PropTypes.func.isRequired,
  showValues: PropTypes.bool.isRequired,
  chartIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default DoubleBarChart;
