import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { FireProvider } from "./context/FireContext";
import { NCR2Provider } from "./context/NCR2Context";
import { NCR1Provider } from "./context/NCR1Context";

// Admin Pages

// Fire Pages
import Fire_OverviewPage from "./pages/client/Fire/Fire_OverviewPage";
import FireDrilldownPage from "./pages/client/Fire/Fire_DrillDownPage";
import Fire_ReportPage from "./pages/client/Fire/Fire_ReportPage";

// ERT Pages
import ERT_OverviewPage from "./pages/client/ERT/ERT_OverviewPage";

// FLS Pages
import FLS_OverviewPage from "./pages/client/FLS/FLS_OverviewPage";

// Malls Pages
import Malls_OverviewPage from "./pages/client/Malls/Malls_OverviewPage";

// ROI Pages
import ROI_OverviewPage from "./pages/client/ROI/ROI_OverviewPage";

// NCR2 Pages
import NCR2_OverviewPage from "./pages/client/NCR2/NCR2_OverviewPage";
import NCR2_DrillDownPage from "./pages/client/NCR2/NCR2_DrillDownPage";
import NCR2_ReportPage from "./pages/client/NCR2/NCR2_ClientReport";

// NCR1 Pages
import NCR1_OverviewPage from "./pages/client/NCR1/NCR1_OverviewPage";
import NCR1_DrillDownPage from "./pages/client/NCR1/NCR1_DrillDownPage";
import NCR1_ReportPage from "./pages/client/NCR1/NCR1_ClientReport";

const App = () => {
  return (
    
      <Router>
        <Navbar />
        <Routes>
          {/* Fire Routes */}
          <Route path="/client/fire/overview" element={
            <FireProvider><Fire_OverviewPage /></FireProvider>
          } />
          <Route path="/client/fire/drilldown/:chartIndex" element={
            <FireProvider><FireDrilldownPage /></FireProvider>
          } />
          <Route path="/client/fire/report/:chartIndex" element={
            <FireProvider><Fire_ReportPage /></FireProvider>
          } />

          {/* ERT Route */}
          <Route path="/client/ert/*" element={<ERT_OverviewPage />} />

          {/* FLS Route */}
          <Route path="/client/fls/*" element={<FLS_OverviewPage />} />

          {/* Malls Route */}
          <Route path="/client/malls/*" element={<Malls_OverviewPage />} />

          {/* ROI Route */}
          <Route path="/client/ROI/*" element={<ROI_OverviewPage />} />

          {/* NCR2 Routes */}
          <Route path="/client/NCR2/overview" element={
            <NCR2Provider><NCR2_OverviewPage /></NCR2Provider>
          } />
          <Route path="/client/NCR2/drilldown/:chartIndex" element={
            <NCR2Provider><NCR2_DrillDownPage /></NCR2Provider>
          } />
          <Route path="/client/NCR2/report/:chartIndex" element={
            <NCR2Provider><NCR2_ReportPage /></NCR2Provider>
          } />

          {/* NCR1 Routes */}
          <Route path="/" element={
            <NCR1Provider><NCR1_OverviewPage /></NCR1Provider>
          } />
          <Route path="/client/NCR1/drilldown/:chartIndex" element={
            <NCR1Provider><NCR1_DrillDownPage /></NCR1Provider>
          } />
          <Route path="/client/NCR1/report/:chartIndex" element={
            <NCR1Provider><NCR1_ReportPage /></NCR1Provider>
          } />
        </Routes>
      </Router>
  );
};

export default App;
