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

const Chart = ({ labels, dataPoints, title }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

Chart.propTypes = {
  labels: PropTypes.array.isRequired,
  dataPoints: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default Chart;
