import { createContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../config/config";

export const FireContext = createContext();

export const FireProvider = ({ children }) => {
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track if initial data has been loaded
  const initialLoadDoneRef = useRef(false);
  // Use ref to track if a fetch is in progress
  const isFetchingRef = useRef(false);
  // Use ref for interval ID
  const intervalRef = useRef(null);

  const fetchFireData = async (isManualRefresh = false) => {
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
      console.log("Fetching fire data...");
      
      const response = await axios.post(
        `${config.API_BASE_URL}/api/dashboard/charts`,
        {
          dashboard_id: "Fire",
          charts: [
            {
              name: "Total Alarms",
              queries: {
                overview_query: {
                  name: "Overview of Total Alarm ",
                  query: "SELECT COUNT(CASE WHEN inlCategory_FRK = 2 THEN 1 END) AS [Total Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 1 THEN 1 END) AS [False Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 2 THEN 1 END) AS [True Alarms], COUNT(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 END) AS [Not Marked] FROM IncidentLog_TBL WHERE inlCategory_FRK = 2 AND CAST(inlDateTime_DTM AS DATE) >= CAST(CONVERT(VARCHAR, GETDATE(), 120) AS DATE) AND CAST(inlDateTime_DTM AS DATE) <= CAST(GETDATE() AS DATE);",
                  legends: ["Total Alarms", "False Alarms", "True Alarms"],
                },
                drill_down_query: {
                  name: "Alarm NCR Wise",
                  query: "SELECT COUNT(CASE WHEN inlCategory_FRK = 2 THEN 1 END) AS [Total Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 1 THEN 1 END) AS [False Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 2 THEN 1 END) AS [True Alarms], COUNT(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 END) AS [Not Marked] FROM IncidentLog_TBL WHERE inlCategory_FRK = 2 AND CAST(inlDateTime_DTM AS DATE) >= CAST(CONVERT(VARCHAR, GETDATE(), 120) AS DATE) AND CAST(inlDateTime_DTM AS DATE) <= CAST(GETDATE() AS DATE);",
                  legends: ["Total Alarms", "False Alarms", "True Alarms"],
                },
                report_query: {
                  name: "Alarm building wise report",
                  query: "SELECT COALESCE(bld.bldBuildingName_TXT, 'Unknown Building') AS Building, COUNT(CASE WHEN inlCategory_FRK = 2 THEN 1 END) AS [Total Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 1 THEN 1 END) AS [False Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 2 THEN 1 END) AS [True Alarms], COUNT(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 END) AS [Not Marked] FROM IncidentLog_TBL il LEFT JOIN Building_TBL bld ON bld.Building_PRK = il.inlBuilding_FRK WHERE inlCategory_FRK = 2 AND CAST(inlDateTime_DTM AS DATE) >= CAST(CONVERT(VARCHAR, GETDATE(), 120) AS DATE) AND CAST(inlDateTime_DTM AS DATE) <= CAST(GETDATE() AS DATE) GROUP BY bld.bldBuildingName_TXT;",
                  legends: ["Total Alarms", "False Alarms", "True Alarms"],
                },
              },
            },
            {
              name: "IOT Device Status",
              queries: {
                overview_query: {
                  name: "Overview of IOT Device",
                  query:
                    "SELECT COUNT(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 END) AS Online, COUNT(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 END) AS Offline, COUNT(PingTest_PRK) AS Total FROM vtasData.dbo.PingTest_TBL LEFT OUTER JOIN vtasData.dbo.Building_TBL ON ptsBuilding_FRK = Building_PRK WHERE PingTest_PRK IN (171, 172, 173, 800, 801, 802, 803, 804, 805, 806);",
                  legends: ["Total", "Offline", "Online"],
                },
                drill_down_query: {
                  name: "IOT Device Status Building Wise",
                  query:
                    "SELECT bldBuildingName_TXT AS 'Building Name', ISNULL([Online], 0) AS Online, ISNULL([Offline], 0) AS Offline, ISNULL([Online], 0) + ISNULL([Offline], 0) AS Total FROM (SELECT bldBuildingName_TXT, CASE WHEN ptsCurrentState_LNG = 1 THEN 'Online' WHEN ptsCurrentState_LNG = 2 THEN 'Offline' END AS Status, PingTest_PRK FROM PingTest_TBL LEFT OUTER JOIN Building_TBL ON ptsBuilding_FRK = Building_PRK WHERE PingTest_PRK IN (171, 172, 173, 800, 801, 802, 803, 804, 805, 806)) AS SourceTable PIVOT (COUNT(PingTest_PRK) FOR Status IN ([Online], [Offline])) AS PivotTable ORDER BY bldBuildingName_TXT;",
                  legends: ["Total", "Online", "Offline"],
                },
                report_query: {
                  name: "IOT Device Report",
                  query:
                    "SELECT ptsDeviceName_TXT AS 'Device Name', ptsIPAddress_TXT AS 'IP Detail', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG = 2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG = 1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM PingTest_TBL WHERE PingTest_PRK IN (171, 172, 173, 800, 801, 802, 803, 804, 805, 806);",
                },
              },
            },
            {
              name: "Hourly Trend",
              queries: {
                overview_query: {
                  name: "Hourly Trend",
                  query:
                    "WITH HourIntervals AS (SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23) SELECT h.HourInterval, COALESCE(i.[Total Alarms], 0) AS [Total Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[False Alarms], 0) AS [False Alarms] FROM HourIntervals h LEFT JOIN (SELECT FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, SUM(CASE WHEN i.inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms] FROM vtasData.dbo.IncidentLog_TBL i WHERE i.inlCategory_FRK = 2 AND i.inlDateTime_DTM >= CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME) GROUP BY FORMAT(i.inlDateTime_DTM, 'HH')) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                  legends: ["Total Alarms", "False Alarms", "True Alarms"],
                },
                drill_down_query: {
                  name: "Hourly Trend NCR-1",
                  query:
                    "WITH HourIntervals AS (SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23) SELECT h.HourInterval, COALESCE(i.[Total Alarms], 0) AS [Total Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[False Alarms], 0) AS [False Alarms] FROM HourIntervals h LEFT JOIN (SELECT FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, SUM(CASE WHEN i.inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms] FROM IncidentLog_TBL i WHERE i.inlCategory_FRK = 2 AND i.inlDateTime_DTM >= CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME) GROUP BY FORMAT(i.inlDateTime_DTM, 'HH')) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                  legends: ["True Alarms", "False Alarms"],
                },
                report_query: {
                  name: "Hourly Trend Alarm",
                  query: null,
                  legends: ["True Alarms", "False Alarms"],
                },
              },
            },
          ],
        }
      );
      
      setFireData(response.data.charts);
      initialLoadDoneRef.current = true;
      
      // Calculate next refresh time if this is a manual refresh or auto-refresh
      if (isManualRefresh || intervalRef.current) {
        const nextRefresh = new Date(Date.now() + (config.REFRESH_INTERVAL || 300000));
        console.log("Next refresh at:", nextRefresh.toLocaleTimeString());
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching fire data:", err);
      setError("Failed to fetch fire data.");
      setLoading(false);
    } finally {
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
      fetchFireData(true);
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
    console.log("FireContext initialized");
    
    // Only fetch if not already loaded
    if (!initialLoadDoneRef.current) {
      fetchFireData();
    }
    
    // Setup auto-refresh timer if configured
    const cleanup = setupAutoRefresh();
    
    // Clean up on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <FireContext.Provider
      value={{
        fireData,
        loading,
        error,
        
        // Expose refresh function for manual refresh
        refreshData: () => fetchFireData(true),
        
        // Functions to enable/disable auto-refresh
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
    </FireContext.Provider>
  );
};

FireProvider.propTypes = {
  children: PropTypes.node.isRequired,
};