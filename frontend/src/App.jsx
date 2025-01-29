import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AppProvider } from "./context/AppContext";
import { FireProvider } from "./context/FireContext";

// Admin Pages
import QueryPage from "./pages/admin/QueryPage";

// Client Pages
import OverviewPage from "./pages/client/DashboardPage/OverviewPage";
import DrillDownPage from "./pages/client/DashboardPage/DrilldownPage";
import ReportPage from "./pages/client/DashboardPage/ClientReport";

// Fire Pages
import Fire_OverviewPage from "./pages/client/Fire/Fire_OverviewPage";
import FireDrilldownPage from "./pages/client/Fire/Fire_DrilldownPage";
import Fire_ReportPage from "./pages/client/Fire/Fire_ReportPage";

// ERT Pages
import ERT_OverviewPage from "./pages/client/ERT/ERT_OverviewPage";

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

          {/* Fire Routes */}
          <Route
            path="/client/fire/*"
            element={
              <FireProvider>
                <Routes>
                  <Route path="overview" element={<Fire_OverviewPage />} />
                  <Route path="drilldown/:chartIndex" element={<FireDrilldownPage />} />
                  <Route path="report/:chartIndex" element={<Fire_ReportPage />} />
                </Routes>
              </FireProvider>
            }
          />

          {/* ERT Route (Fixed) */}
          <Route path="/client/ert/*" element={<ERT_OverviewPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
