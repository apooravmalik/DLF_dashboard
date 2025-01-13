import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const Card = ({ name, createdAt, link, dashboardId }) => {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg m-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-sm text-gray-500">Created at: {createdAt}</p>
        <p className="text-sm text-gray-500">ID: {dashboardId}</p>
        <Link
          to={`${link}`}
          className="text-blue-500 hover:underline mt-2 block"
        >
          View Dashboard
        </Link>
      </div>
    );
  };

Card.propTypes = {
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  dashboardId: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default Card;
