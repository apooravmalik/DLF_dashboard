import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "./Card";
import DLFLogo from "../assets/DLF.NS_BIG.D.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [mouseInTriggerZone, setMouseInTriggerZone] = useState(false);
  const [mouseInNavbar, setMouseInNavbar] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Function to toggle the sidebar
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to go back to the previous page
  const goBack = () => {
    navigate(-1);
  };

  // Check if we should show back button
  const showBackButton = location.pathname.includes("drilldown") || location.pathname.includes("report");

  // Effect to handle the navbar visibility
  useEffect(() => {
    if (mouseInTriggerZone || mouseInNavbar) {
      setNavbarVisible(true);
    } else {
      // Add a small delay before hiding to avoid flickering
      const timer = setTimeout(() => {
        setNavbarVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [mouseInTriggerZone, mouseInNavbar]);

  return (
    <>
      {/* Hover trigger zone - an invisible area at the top of the screen */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-50"
        onMouseEnter={() => setMouseInTriggerZone(true)}
        onMouseLeave={() => setMouseInTriggerZone(false)}
      />

      {/* Navbar - slides down when hovered */}
      <nav 
        className={`fixed top-0 left-0 right-0 bg-[#3f505d] p-2 text-white flex justify-between items-center z-40 transition-transform duration-300 ease-in-out ${
          navbarVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
        }`}
        onMouseEnter={() => setMouseInNavbar(true)}
        onMouseLeave={() => setMouseInNavbar(false)}
      >
        {/* Back button (conditionally rendered) */}
        <div className="w-1/3">
          {showBackButton && (
            <button
              onClick={goBack}
              className="text-white focus:outline-none hover:bg-gray-700 rounded-full p-2"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Logos section (always centered) */}
        <div className="flex items-center space-x-4 w-1/3 justify-center">
          <img src={DLFLogo} alt="DLF Logo" className="h-10" />
        </div>

        {/* Sidebar toggle button (right-aligned) */}
        <div className="w-1/3 flex justify-end">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            &#9776;
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
          ✕
        </button>

        {/* Sidebar content */}
        <div className="p-6 space-y-4 mt-10">
          <Card name="Fire" createdAt="2024-12-30" link="/client/fire/overview" dashboardId="2" />
          <Card name="Fire-ERT" createdAt="2025-01-31" link="/client/ert/overview" dashboardId="3" />
          <Card name="Fire-FLS" createdAt="2025-01-31" link="/client/fls/overview" dashboardId="4" />
          <Card name="Malls" createdAt="2025-04-09" link="/client/Malls/overview" dashboardId="5" />
          <Card name="ROI" createdAt="2025-04-10" link="/client/ROI/overview" dashboardId="6" />
          <Card name="NCR2" createdAt="2025-04-10" link="/client/NCR2/overview" dashboardId="7" />
          <Card name="NCR1" createdAt="2025-04-10" link="/" dashboardId="8" />
        </div>
      </div>

      {/* Overlay to close the sidebar when clicked outside */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}></div>
      )}
    </>
  );
};

export default Navbar;