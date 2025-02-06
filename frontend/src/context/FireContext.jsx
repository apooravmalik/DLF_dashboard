// FireContext.js
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../config/config";
export const FireContext = createContext();

export const FireProvider = ({ children }) => {
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFireData = async () => {
      try {
        const response = await axios.post(
          `${config.API_BASE_URL}/api/dashboard/charts`,
          {
            dashboard_id: "Fire",
            charts: [
              {
                name: "Recorder Status",
                queries: {
                  overview_query: {
                    name: "Overview of Recorder Status",
                    query:
                      "SELECT COUNT(CASE WHEN inlCategory_FRK = 2 THEN 1 END) AS [Total Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 1 THEN 1 END) AS [False Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 2 THEN 1 END) AS [True Alarms] FROM Test2.dbo.IncidentLog_TBL il LEFT JOIN Test2.dbo.ProEvent_TBL pe ON il.inlAlarmProEvent_FRK = pe.ProEvent_PRK LEFT JOIN Test2.dbo.DeviceStateLink_TBL dst ON dst.dstProEvent_FRK = pe.ProEvent_PRK LEFT JOIN Test2.dbo.Device_TBL d ON d.Device_PRK = dst.dstDevice_FRK LEFT JOIN Test2.dbo.IncidentCategory_TBL ict ON ict.IncidentCategory_PRK = il.inlCategory_FRK LEFT JOIN Test2.dbo.CameraZone_TBL czt ON czt.CameraZone_PRK = il.inlZone_FRK LEFT JOIN Test2.dbo.Street_TBL st ON st.Street_PRK = il.inlStreet_FRK LEFT JOIN Test2.dbo.Building_TBL b ON b.Building_PRK = il.inlBuilding_FRK LEFT JOIN Test2.dbo.Unit_TBL ut ON ut.Unit_PRK = il.inlUnit_FRK LEFT JOIN Test2.dbo.ProAlarmType_TBL pat ON pat.ProAlarmType_PRK = il.inlProAlarmType_FRK LEFT JOIN Test2.dbo.Camera_TBL ct ON ct.Camera_PRK = d.dvcCamera_FRK WHERE il.inlCategory_FRK IN (2) AND dvcName_TXT NOT LIKE '%panel zone 1%' AND il.inlDateTime_DTM >= DATEADD(DAY, -30, CAST(SYSDATETIME() AS DATE));",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  drill_down_query: {
                    name: "Alarm NCR Wise",
                    query:
                      "SELECT COUNT(CASE WHEN inlCategory_FRK = 2 THEN 1 END) AS [Total Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 1 THEN 1 END) AS [False Alarms], COUNT(CASE WHEN inlSubCategory_FRK = 2 THEN 1 END) AS [True Alarms] FROM Test2.dbo.IncidentLog_TBL il LEFT JOIN Test2.dbo.ProEvent_TBL pe ON il.inlAlarmProEvent_FRK = pe.ProEvent_PRK LEFT JOIN Test2.dbo.DeviceStateLink_TBL dst ON dst.dstProEvent_FRK = pe.ProEvent_PRK LEFT JOIN Test2.dbo.Device_TBL d ON d.Device_PRK = dst.dstDevice_FRK LEFT JOIN Test2.dbo.IncidentCategory_TBL ict ON ict.IncidentCategory_PRK = il.inlCategory_FRK LEFT JOIN Test2.dbo.CameraZone_TBL czt ON czt.CameraZone_PRK = il.inlZone_FRK LEFT JOIN Test2.dbo.Street_TBL st ON st.Street_PRK = il.inlStreet_FRK LEFT JOIN Test2.dbo.Building_TBL b ON b.Building_PRK = il.inlBuilding_FRK LEFT JOIN Test2.dbo.Unit_TBL ut ON ut.Unit_PRK = il.inlUnit_FRK LEFT JOIN Test2.dbo.ProAlarmType_TBL pat ON pat.ProAlarmType_PRK = il.inlProAlarmType_FRK LEFT JOIN Test2.dbo.Camera_TBL ct ON ct.Camera_PRK = d.dvcCamera_FRK WHERE il.inlCategory_FRK IN (2) AND dvcName_TXT NOT LIKE '%panel zone 1%' AND il.inlDateTime_DTM >= DATEADD(DAY, -30, CAST(SYSDATETIME() AS DATE));",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  report_query: {
                    name: "Alarm building wise report",
                    query:
                      "WITH AggregatedData AS ( SELECT SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms], bldBuildingName_TXT, COUNT(*) AS TotalAlarms FROM Test2.dbo.IncidentLog_TBL il LEFT OUTER JOIN Test2.dbo.ProEvent_TBL pe ON il.inlAlarmProEvent_FRK = pe.ProEvent_PRK LEFT OUTER JOIN Test2.dbo.DeviceStateLink_TBL dst ON dst.dstProEvent_FRK = pe.ProEvent_PRK LEFT OUTER JOIN Test2.dbo.Device_TBL d ON d.Device_PRK = dst.dstDevice_FRK LEFT OUTER JOIN Test2.dbo.Building_TBL b ON b.Building_PRK = il.inlBuilding_FRK WHERE il.inlCategory_FRK IN (2) AND dvcName_TXT NOT LIKE '%panel zone 1%' AND CAST(inlDateTime_DTM AS DATE) >= DATEADD(DAY, -30, CAST(GETDATE() AS DATE)) GROUP BY bldBuildingName_TXT ) SELECT COALESCE(a.bldBuildingName_TXT, 'Unknown Building') AS Building, COALESCE(a.[False Alarms], 0) AS [False Alarms], COALESCE(a.[True Alarms], 0) AS [True Alarms], COALESCE(a.TotalAlarms, 0) AS TotalAlarms FROM AggregatedData a ORDER BY a.bldBuildingName_TXT;",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                },
              },
              {
                name: "Camera Status",
                queries: {
                  overview_query: {
                    name: "Overview of IOT Device",
                    query:
                      "SELECT COUNT(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 END) AS Online, COUNT(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 END) AS Offline, COUNT(PingTest_PRK) AS Total FROM TEST.dbo.PingTest_TBL LEFT OUTER JOIN TEST.dbo.Building_TBL ON ptsBuilding_FRK = Building_PRK WHERE PingTest_PRK IN (171, 172, 173);",
                    legends: ["Total", "Offline", "Online"],
                  },
                  drill_down_query: {
                    name: "IOT Device Status Building Wise",
                    query:
                      "SELECT bldBuildingName_TXT AS 'Building Name', ISNULL([Online], 0) AS Online, ISNULL([Offline], 0) AS Offline, ISNULL([Online], 0) + ISNULL([Offline], 0) AS Total FROM ( SELECT bldBuildingName_TXT, CASE WHEN ptsCurrentState_LNG = 1 THEN 'Online' WHEN ptsCurrentState_LNG = 2 THEN 'Offline' END AS Status, PingTest_PRK FROM Test.dbo.PingTest_TBL LEFT OUTER JOIN Test.dbo.Building_TBL ON ptsBuilding_FRK = Building_PRK WHERE PingTest_PRK IN (171, 172, 173) ) AS SourceTable PIVOT ( COUNT(PingTest_PRK) FOR Status IN ([Online], [Offline]) ) AS PivotTable ORDER BY bldBuildingName_TXT;",
                    legends: ["Total", "Online", "Offline"],
                  },
                  report_query: {
                    name: "IOT Device Report",
                    query:
                      "select ptsDeviceName_TXT as 'Device Name' ,ptsIPAddress_TXT 'IP Detail', ptsOfflineTime_DTM as 'Offline Date Time',case when ptsCurrentState_LNG=2 and ptsOfflineTime_DTM is not null then 'Offline' when ptsCurrentState_LNG=1 then 'Online' end as Status, DATEDIFF(HH,ptsOfflineTime_DTM,GETDATE()) AS 'Down Time (hours)' from Test.dbo.PingTest_TBL where PingTest_PRK in (171,172,173)",
                  },
                },
              },
              {
                name: "Device Status",
                queries: {
                  overview_query: {
                    name: "Hourly Trend",
                    query:
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23 ) SELECT h.HourInterval, COALESCE(i.[Total Alarms], 0) AS [Total Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[False Alarms], 0) AS [False Alarms] FROM HourIntervals h LEFT JOIN ( SELECT FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, SUM(CASE WHEN i.inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms] FROM Test2.dbo.IncidentLog_TBL i WHERE i.inlCategory_FRK = 2 AND i.inlDateTime_DTM >= DATEADD(DAY, -30, CAST(SYSDATETIME() AS DATE)) GROUP BY FORMAT(i.inlDateTime_DTM, 'HH') ) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  drill_down_query: {
                    name: "Hourly Trend NCR-1",
                    query:
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23 ) SELECT h.HourInterval, COALESCE(i.[Total Alarms], 0) AS [Total Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[False Alarms], 0) AS [False Alarms] FROM HourIntervals h LEFT JOIN ( SELECT FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, SUM(CASE WHEN i.inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN i.inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms] FROM Test2.dbo.IncidentLog_TBL i WHERE i.inlCategory_FRK = 2 AND i.inlDateTime_DTM >= DATEADD(DAY, -30, CAST(SYSDATETIME() AS DATE)) GROUP BY FORMAT(i.inlDateTime_DTM, 'HH') ) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching fire data:", err);
        setError("Failed to fetch fire data.");
        setLoading(false);
      }
    };

    fetchFireData();
  }, []);

  return (
    <FireContext.Provider
      value={{
        fireData,
        loading,
        error,
      }}
    >
      {children}
    </FireContext.Provider>
  );
};

FireProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
