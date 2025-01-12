// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AppProvider } from "./context/AppContext";

// Admin Pages
import QueryPage from "./pages/admin/QueryPage";

// Client Pages
import OverviewPage from "./pages/client/DashboardPage/OverviewPage";
import DrillDownPage from "./pages/client/DashboardPage/DrilldownPage";
import ReportPage from "./pages/client/DashboardPage/ClientReport";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/query" element={<QueryPage />} />

          {/* Client Routes */}
          <Route path="/client/dashboard-1/overview" element={<OverviewPage />} />
          <Route path="/client/dashboard-1/drilldown/:chartIndex" element={<DrillDownPage />} />
          <Route path="/client/dashboard-1/report/:chartIndex" element={<ReportPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;