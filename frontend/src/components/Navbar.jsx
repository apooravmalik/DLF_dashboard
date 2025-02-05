// Import required libraries and components
import { Link, useNavigate, useLocation } from "react-router-dom"; // For navigation and routing
import { useState, useEffect } from "react"; // React hooks for state management and lifecycle methods
import Card from "./Card"; // Custom Card component
import DLFLogo from "../assets/DLF.NS_BIG.D.png"; // Importing DLF logo
import VeracityLogo from "../assets/Veracity_logo.png"; // Importing Veracity logo

// Navbar component
const Navbar = () => {
  // State to control whether the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // State to store the refresh time (in seconds) selected by the user
  const [refreshTime, setRefreshTime] = useState(null);

  // Hooks for navigation and getting the current route
  const navigate = useNavigate();
  const location = useLocation();

  // Function to toggle the sidebar open or closed
  const toggleMenu = () => {
    setIsOpen(!isOpen); // Invert the current state
  };

  // Function to go back to the previous page (like a browser back button)
  const goBack = () => {
    navigate(-1); // Navigate back by one page
  };

  // Function to handle changes to the refresh time dropdown
  const handleRefreshTimeChange = (event) => {
    const time = parseInt(event.target.value, 10); // Convert selected value to an integer
    setRefreshTime(time); // Update the refresh time state
  };

  // Effect that runs whenever `refreshTime` changes
  useEffect(() => {
    if (refreshTime) {
      // Set a timer based on the refresh time selected by the user
      const timer = setTimeout(() => {
        // Get the current route path
        const currentPath = location.pathname;

        // Modify the current path to redirect to its corresponding overview page
        const overviewPath = currentPath.replace(/\/[^/]+$/, "/overview");

        // Navigate to the overview page
        navigate(overviewPath, { replace: true });

        // Refresh the page to force reloading data
        window.location.reload();
      }, refreshTime * 1000); // Convert seconds to milliseconds

      // Cleanup function to clear the timer when the component unmounts or refreshTime changes
      return () => clearTimeout(timer);
    }
  }, [refreshTime, navigate, location.pathname]);

  // Return the JSX structure for the Navbar component
  return (
    <>
      {/* Top navigation bar */}
      <nav className="bg-gray-800 p-2 text-white flex justify-between items-center relative z-50">
        {/* Back button */}
        <button
          onClick={goBack}
          className="text-white focus:outline-none hover:bg-gray-700 rounded-full p-2"
        >
          ← Back {/* Unicode arrow for back */}
        </button>

        {/* Logos section */}
        <div className="flex items-center space-x-4">
          {/* DLF logo */}
          <img
            src={DLFLogo}
            alt="DLF Logo"
            className="h-10" // Adjust height as needed
          />
          {/* Veracity logo */}
          <img
            src={VeracityLogo}
            alt="Veracity Logo"
            className="h-16" // Adjust height as needed
          />
        </div>

        {/* Right-side controls: refresh time dropdown and menu toggle button */}
        <div className="flex items-center">
          {/* Dropdown for selecting refresh time */}
          <select
            onChange={handleRefreshTimeChange}
            className="bg-gray-700 text-white p-1 rounded-md mr-4"
          >
            <option value="">Select refresh time</option> {/* Default option */}
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1200">20 minutes</option>
            <option value="1800">30 minutes</option>
          </select>

          {/* Button to toggle the sidebar */}
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            &#9776; {/* Unicode hamburger menu icon */}
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-[#18181B] text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        {/* Close button for sidebar */}
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-white focus:outline-none"
        >
          ✕ {/* Unicode cross icon */}
        </button>

        {/* Sidebar content */}
        <div className="p-6 space-y-4 mt-10">
          {/* Links and cards */}
          <Link to="/" className="block text-white hover:underline">
            Home {/* Link to the home page */}
          </Link>
          <Link to="/query" className="block text-white hover:underline">
            Admin {/* Link to the admin page */}
          </Link>

          {/* Cards representing different dashboards */}
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
          <Card
            name="Fire-ERT"
            createdAt="2025-01-31"
            link="/client/ert/overview"
            dashboardId="3"
          />
          <Card
            name="Fire-FLS"
            createdAt="2025-01-31"
            link="/client/fls/overview"
            dashboardId="4"
          />
          <Card
            name="RJOC-DT"
            createdAt="2025-02-4"
            link="/client/rjoc_dt/overview"
            dashboardId="5"
          />
        </div>
      </div>

      {/* Overlay to close the sidebar when clicked outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu} // Close sidebar on clicking the overlay
        ></div>
      )}
    </>
  );
};

export default Navbar;
