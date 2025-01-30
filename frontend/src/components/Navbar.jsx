import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "./Card";
import DLFLogo from "../assets/DLF.NS_BIG.D.png"; // Import DLF logo
import VeracityLogo from "../assets/Veracity_logo.png"; // Import Veracity logo

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshTime, setRefreshTime] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const goBack = () => {
    navigate(-1); // goBack == browser's back button
  };

  const handleRefreshTimeChange = (event) => {
    const time = parseInt(event.target.value, 10);
    setRefreshTime(time);
  };

  useEffect(() => {
    if (refreshTime) {
      const timer = setTimeout(() => {
        // Dynamically determine the current route and redirect to the corresponding overview page
        const currentPath = location.pathname;
        const overviewPath = currentPath.replace(/\/[^/]+$/, "/overview");

        navigate(overviewPath, { replace: true });
        // Force a refresh of the page
        window.location.reload();
      }, refreshTime * 1000);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount or refreshTime change
    }
  }, [refreshTime, navigate, location.pathname]);

  return (
    <>
      <nav className="bg-gray-800 p-2 text-white flex justify-between items-center relative z-50">
        <button
          onClick={goBack}
          className="text-white focus:outline-none hover:bg-gray-700 rounded-full p-2"
        >
          ← Back
        </button>
        <div className="flex items-center space-x-4">
          <img
            src={DLFLogo}
            alt="DLF Logo"
            className="h-10" // Adjust height as needed
          />
          <img
            src={VeracityLogo}
            alt="Veracity Logo"
            className="h-16" // Adjust height as needed
          />
        </div>
        <div className="flex items-center">
          <select
            onChange={handleRefreshTimeChange}
            className="bg-gray-700 text-white p-1 rounded-md mr-4"
          >
            <option value="">Select refresh time</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1200">20 minutes</option>
            <option value="1800">30 minutes</option>
          </select>
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            &#9776;
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-[#18181B] text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-white focus:outline-none"
        >
          ✕
        </button>
        <div className="p-6 space-y-4 mt-10">
          <Link to="/" className="block text-white hover:underline">
            Home
          </Link>
          <Link to="/query" className="block text-white hover:underline">
            Admin
          </Link>
          <Card
            name="Dashboard 1"
            createdAt="2024-12-30"
            link="/client/dashboard-1/overview"
            dashboardId="1"
          />
          <Card
            name="Fire"
            createdAt="2024-12-30"
            link="/client/fire/overview"
            dashboardId="2"
          />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;