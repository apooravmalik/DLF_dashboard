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

// Fire Page
import Fire_OverviewPage from "./pages/client/Fire/Fire_Overviewpage";
import FireDrilldownPage from "./pages/client/Fire/Fire_DrillDownPage";
import Fire_ReportPage from "./pages/client/Fire/Fire_ReportPage";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/query" element={<QueryPage />} />

          {/* Dashboard-1 Routes */}
          <Route path="/client/dashboard-1/overview" element={<OverviewPage />} />
          <Route path="/client/dashboard-1/drilldown/:chartIndex" element={<DrillDownPage />} />
          <Route path="/client/dashboard-1/report/:chartIndex" element={<ReportPage />} />

          {/* Fire Route */}
          <Route path="/client/fire/overview" element={<Fire_OverviewPage />} />
          <Route path="/client/fire/drilldown/:chartIndex" element={<FireDrilldownPage />} />
          <Route path="/client/fire/report/:chartIndex" element={<Fire_ReportPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;