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

const Chart = ({ labels, dataPoints, title, colors, onBarClick, path }) => {
  const navigate = useNavigate();

  if (!labels || !dataPoints) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Error: Missing chart data
      </div>
    );
  }

  const defaultColor = "#808080"; // Default gray color for missing entries
  const labelColorMapping = labels.reduce((acc, label, index) => {
    acc[label] = colors[index] || defaultColor;
    return acc;
  }, {});
  const orderedColors = labels.map((label) => labelColorMapping[label] || defaultColor);

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataPoints,
        backgroundColor: orderedColors,
        borderColor: orderedColors.map((color) => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedAttribute = labels[index];
        if (onBarClick) {
          onBarClick(clickedAttribute);
        }
        if (path) {
          navigate(path);
        }
      }
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            return labels.map((label, index) => ({
              text: label,
              fillStyle: dataset.backgroundColor[index],
              strokeStyle: dataset.borderColor[index],
              hidden: false,
              index: index,
              fontColor: "#FFFFFF",
            }));
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: "#F7FAFC",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleColor: "#F7FAFC",
        bodyColor: "#E2E8F0",
        borderColor: "#4B5563",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
      },
      datalabels: {
        display: true,
        color: "#FFFFFF",
        font: {
          size: 18,
          weight: "bold",
        },
        anchor: "end",
        align: "start",
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
        ticks: {
          color: "#E2E8F0",
        },
      },
      y: {
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
        ticks: {
          color: "#E2E8F0",
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
      easing: "easeOutQuart",
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
  onBarClick: PropTypes.func,
  path: PropTypes.string, // New prop for custom redirection path
};

Chart.defaultProps = {
  colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
  onBarClick: null,
  path: null, // Default is no path
};

export default Chart;
