// NCR2Context.js
import { createContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../config/config";

export const NCR2Context = createContext();

export function NCR2Provider({ children }) {
  // State for admin workflows
  const [queries, setQueries] = useState([]);
  const [queryResults, setQueryResults] = useState([]);

  // State for client workflows
  const [chartsData, setChartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track if initial data has been loaded
  const initialLoadDoneRef = useRef(false);
  // Use ref to track if a fetch is in progress
  const isFetchingRef = useRef(false);
  // Use ref for interval ID
  const intervalRef = useRef(null);

  const fetchData = async (isManualRefresh = false) => {
    // Skip if a fetch is already in progress
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    // Skip if initial load is done and this is not a manual refresh or timer-based refresh
    if (initialLoadDoneRef.current && !isManualRefresh && !intervalRef.current) {
      console.log("Initial load already complete, skipping redundant fetch");
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      
      const response = await axios.post(
        `${config.API_BASE_URL}/api/dashboard/charts`,
        {
          "dashboard_id": "NCR2",
          charts: [
            {
              name: "Recorder Status",
              queries: {
                overview_query: {
                  name: "Recorder Status",
                  query:
                    "SELECT COUNT(*) AS 'Total', SUM(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL WHERE ptsCameraZone_FRK = 4 AND (PingTest_PRK NOT BETWEEN 603 AND 786) AND (PingTest_PRK NOT BETWEEN 800 AND 806);;",
                  legends: ["Total", "Online", "Offline"],
                },
                drill_down_query: {
                  name: "Recorder Status Building Wise",
                  query:
                    "SELECT bldBuildingName_TXT AS 'Building Name', SUM(CASE WHEN pts.ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN pts.ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL pts JOIN Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 4 AND (PingTest_PRK NOT BETWEEN 603 AND 786) AND (PingTest_PRK NOT BETWEEN 800 AND 806) GROUP BY bldBuildingName_TXT ORDER BY [Building Name];",
                  legends: ["Building Name", "Online", "Offline"],
                },
                report_query: {
                  name: "Recorder Status Building Wise Report",
                  query:
                    "SELECT ptsDeviceName_TXT AS 'Name', ptsIPAddress_TXT AS 'IP Detail', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG=2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG=1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM [vtasData].[dbo].PingTest_TBL JOIN [vtasData].[dbo].Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN [vtasData].[dbo].Street_TBL ON Street_PRK = ptsStreet_FRK JOIN [vtasData].[dbo].CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 4 and ptsBuilding_FRK in (1126,1128,1135,1134,1165,1129,1130,1132,1133,1155,1157,1158,1127,1137)  ORDER BY [Building Name], Region, [Device Name];",
                },
              },
            },
          ],
        },
      );
      
      setChartsData(response.data.charts);
      initialLoadDoneRef.current = true;
      
      if (isManualRefresh || intervalRef.current) {
        const nextRefresh = new Date(Date.now() + (config.REFRESH_INTERVAL || 300000));
        console.log("Next refresh at:", nextRefresh.toLocaleTimeString());
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Setup auto-refresh function
  const setupAutoRefresh = () => {
    // Only setup if auto-refresh is needed per config
    if (config.AUTO_REFRESH === false) {
      console.log("Auto-refresh disabled in config");
      return;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      console.log("Auto-refresh triggered");
      fetchData(true);
    }, config.REFRESH_INTERVAL || 300000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  };

  // Load data only once when component mounts
  useEffect(() => {
    console.log("NCR2Context initialized");
    
    // Only fetch if not already loaded
    if (!initialLoadDoneRef.current) {
      fetchData();
    }
    
    // Setup auto-refresh timer if configured
    const cleanup = setupAutoRefresh();
    
    // Clean up on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <NCR2Context.Provider
      value={{
        // Admin capabilities
        queries,
        setQueries,
        queryResults,
        setQueryResults,

        // Client capabilities
        chartsData,
        loading,
        error,
        
        // Expose refresh function for manual refresh
        refreshData: () => fetchData(true),
        
        // Function to enable/disable auto-refresh
        enableAutoRefresh: setupAutoRefresh,
        disableAutoRefresh: () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log("Auto-refresh disabled");
          }
        }
      }}
    >
      {children}
    </NCR2Context.Provider>
  );
}

NCR2Provider.propTypes = {
  children: PropTypes.node.isRequired,
};