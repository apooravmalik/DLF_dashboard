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

const DoubleBarChartTEST = ({
  labels,
  dataPoints,
  title,
  colors,
  onBarClick,
  showValues,
  chartIndex,
  isStacked,
  drillDownData, // Added drillDownData prop
}) => {
  const navigate = useNavigate();

  if (!labels || !dataPoints || dataPoints.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Error: Missing chart data or incorrect data format
      </div>
    );
  }

//   console.log("Drill Down Data:", drillDownData); // Check the drillDownData prop

  const barData = {
    labels: labels,
    datasets: dataPoints.map((point, index) => {
      // Access the label from drillDownData based on the index
      const label = drillDownData?.data?.[index]?.counts?.[index]?.type || `Dataset ${index + 1}`;
    //   console.log(`Dataset ${index + 1}:`, label); // Log the dataset label for each index
      return {
        label: label,
        data: point,
        backgroundColor: colors[index] || "#808080",
        borderColor: colors[index] || "#808080",
        borderWidth: 1,
        stack: isStacked ? `Stack ${Math.floor(index / 2) + 1}` : undefined, // Conditionally assign stack names
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
            const labels = chart.data.datasets.map((dataset, index) => {
              console.log(`Legend for Dataset ${index + 1}:`, dataset.label); // Log the legend label being added
              return {
                text: dataset.label, // Use the dynamically set label for each dataset
                fillStyle: dataset.backgroundColor,
                strokeStyle: dataset.borderColor,
                hidden: false,
                index,
                fontColor: "#FFFFFF",
              };
            });
            console.log("Legend Labels:", labels); // Check the final generated legend labels
            return labels;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: isStacked, // Dynamically set stacking for x-axis
      },
      y: {
        stacked: isStacked, // Dynamically set stacking for y-axis
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const barIndex = elements[0].index;
        const label = labels[barIndex];
        onBarClick(label);
        navigate(`/client/DashboardPage/report/${chartIndex}`);
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

DoubleBarChartTEST.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
  onBarClick: PropTypes.func.isRequired,
  showValues: PropTypes.bool.isRequired,
  chartIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isStacked: PropTypes.bool, // New prop for toggling stacking
  drillDownData: PropTypes.object.isRequired, // Accept drillDownData as a prop
};

DoubleBarChartTEST.defaultProps = {
  isStacked: false, // Default to non-stacked
};

export default DoubleBarChartTEST;
