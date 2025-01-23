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

const DoubleBarChart = ({
  labels,
  dataPoints,
  title,
  colors,
  onBarClick,
  showValues,
  isStacked,
  drillDownData,
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
      const label = drillDownData?.data?.[index]?.counts?.[index]?.type || `Dataset ${index + 1}`;
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
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              hidden: false,
              index,
              fontColor: "#FFFFFF",
            }));
          },
        },
      },
    },
    scales: {
      x: {
        stacked: isStacked,
      },
      y: {
        stacked: isStacked,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const barIndex = elements[0].index;
        const label = labels[barIndex];
        if (onBarClick) {
          onBarClick(label);
        };
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
  isStacked: PropTypes.bool,
  drillDownData: PropTypes.object.isRequired,
};

DoubleBarChart.defaultProps = {
  isStacked: false,
  path: null, // Default is no path
};

export default DoubleBarChart;
