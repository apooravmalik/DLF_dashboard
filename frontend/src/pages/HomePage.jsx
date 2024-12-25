import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#18181B] text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p className="text-lg mb-6">Start by entering your SQL queries.</p>
        <Link
          to="/query"
          className="bg-[#2196F3] text-white px-6 py-3 rounded-lg hover:bg-[#1976D2]"
        >
          Go to Query Page
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
