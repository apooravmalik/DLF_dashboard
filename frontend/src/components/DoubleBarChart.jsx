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

const DoubleBarChart = ({
  labels,
  dataPoints,
  title,
  colors,
  onBarClick,
  showValues,
  isStacked,
  drillDownData,
  chartIndex,
}) => {
  if (!labels || !dataPoints || dataPoints.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Error: Missing chart data or incorrect data format
      </div>
    );
  }

  const barData = {
    labels: labels,
    datasets: dataPoints.map((point, index) => {
      let label;
      if (chartIndex === "camera") {
        label = index === 0 ? "Online" : "Offline";
      } else {
        label =
          drillDownData?.data?.[index]?.counts?.[index]?.type ||
          (index === 0 ? "Online" : "Offline");
      }
      return {
        label: label,
        data: point,
        backgroundColor: colors[index] || "#808080",
        borderColor: colors[index] || "#808080",
        borderWidth: 1,
        stack: isStacked ? `Stack ${Math.floor(index / 2) + 1}` : undefined,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container
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
        anchor: "end",
        color: "#FFFFFF",
        font: {
          size: 14,
        },
      },
      legend: {
        position: "top",
        labels: {
          color: "#FFFFFF",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: "#FFFFFF",
        font: {
          size: 18,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        stacked: isStacked,
        ticks: {
          font: {
            size: 12,
          },
          color: "#FFFFFF",
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: isStacked,
        ticks: {
          font: {
            size: 12,
          },
          color: "#FFFFFF",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        beginAtZero: true,
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10,
      },
    },
    datasets: {
      bar: {
        barThickness: 40, // Fixed thickness to prevent shrinking
        maxBarThickness: 50,
        minBarLength: 2, // Ensure bars are visible even with small values
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const barIndex = elements[0].index;
        const datasetIndex = elements[0].datasetIndex;
        const label = labels[barIndex];
        const status = dataPoints[datasetIndex]?.status || (datasetIndex === 0 ? "Online" : "Offline");
    
        if (onBarClick) {
          onBarClick(label, status);
        }
      }
    }
    
  };

  console.log("DoubleBarChart container height:", document.querySelector(".w-full.h-full")?.offsetHeight);

  return (
    <div className="w-full h-full">
      <Bar data={barData} options={options} />
    </div>
  );
};

DoubleBarChart.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
  onBarClick: PropTypes.func,
  showValues: PropTypes.bool.isRequired,
  chartIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isStacked: PropTypes.bool,
  drillDownData: PropTypes.object,
};

DoubleBarChart.defaultProps = {
  isStacked: false,
  onBarClick: null,
  chartIndex: null,
  drillDownData: null,
};

export default DoubleBarChart;