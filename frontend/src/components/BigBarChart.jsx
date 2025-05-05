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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Chart = ({ labels, dataPoints, title, colors, onBarClick }) => {
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
  const orderedColors = labels.map(
    (label) => labelColorMapping[label] || defaultColor
  );

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
      }
    },
    plugins: {
      legend: {
        position: "top",
        fullSize: false,
        labels: {
          color: "#FFFFFF",
          padding: 20,
          font: {
            size: 14,
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
        display: (context) => context.dataset.data[context.dataIndex] !== 0,
        color: "#FFFFFF",
        font: {
          size: 24,
          weight: "bold",
        },
        anchor: "end",
        align: "end",
        offset: -10,
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
        categoryPercentage: 0.2, // Reduces spacing between bars  
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...dataPoints) + 18, // Slightly above the max value to shrink bar height
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#E2E8F0",
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutQuart",
    },
    datasets: {
    bar: {
      barThickness: 260, // Controls the exact thickness of the bars
      maxBarThickness: 290, // Ensures bars do not get too wide
    },
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
};

Chart.defaultProps = {
  colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
  onBarClick: null,
};

export default Chart;
