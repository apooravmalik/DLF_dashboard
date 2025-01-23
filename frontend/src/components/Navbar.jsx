import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "./Card";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const goBack = () => {
    navigate(-1); // goBack == browser's back button
  };

  return (
    <>
      <nav className="bg-gray-800 p-2 text-white flex justify-between items-center relative z-50">
        <button
          onClick={goBack}
          className="text-white focus:outline-none hover:bg-gray-700 rounded-full p-2"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">DLF Dashboard</h1>
        <button onClick={toggleMenu} className="text-white focus:outline-none">
          &#9776;
        </button>
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
