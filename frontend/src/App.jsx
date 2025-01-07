// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AppProvider } from "./context/AppContext";

// Admin Pages
import QueryPage from "./pages/admin/QueryPage";

// Client Pages
import OverviewPage from "./pages/client/OverviewPage";
import DrillDownPage from "./pages/client/DrilldownPage";
import ReportPage from "./pages/client/ClientReport";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/query" element={<QueryPage />} />

          {/* Client Routes */}
          <Route path="/client/overview" element={<OverviewPage />} />
          <Route path="/client/drilldown/:chartIndex" element={<DrillDownPage />} />
          <Route path="/client/report/:chartIndex" element={<ReportPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;