import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QueryPage from "./pages/QueryPage";
import ReportPage from "./pages/ReportPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default App;
