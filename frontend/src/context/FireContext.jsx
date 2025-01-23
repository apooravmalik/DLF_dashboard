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
            charts: [
              {
                name: "Recorder Status",
                queries: {
                  overview_query: {
                    name: "Overview of Recorder Status",
                    query:
                      "SELECT COUNT(*) AS 'Total Alarms', SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS 'False Alarms', SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS 'True Alarms', SUM(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 ELSE 0 END) AS 'Not Marked' FROM IncidentLog_TBL LEFT OUTER JOIN Device_TBL ON Device_PRK = inlSourceDevice_FRK LEFT OUTER JOIN IncidentCategory_TBL ON inlCategory_FRK = IncidentCategory_PRK WHERE dvcDeviceType_FRK IN (19,20) AND inlCategory_FRK IN (2)",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  drill_down_query: {
                    name: "Alarm NCR Wise",
                    query:
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23 ), AggregatedData AS ( SELECT SUM(CASE WHEN inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms], SUM(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 ELSE 0 END) AS [Not Marked], YEAR(inlDateTime_DTM) AS Year, MONTH(inlDateTime_DTM) AS Month, DATENAME(MONTH, inlDateTime_DTM) AS MonthName, CASE WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Monday' THEN '1-MON' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Tuesday' THEN '2-TUE' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Wednesday' THEN '3-WED' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Thursday' THEN '4-THU' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Friday' THEN '5-FRI' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Saturday' THEN '6-SAT' WHEN DATENAME(WEEKDAY, inlDateTime_DTM) = 'Sunday' THEN '7-SUN' END AS DayName, CASE WHEN DATEPART(WEEK, inlDateTime_DTM) - DATEPART(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, inlDateTime_DTM), 0)) = 0 THEN 'Week-1' WHEN DATEPART(WEEK, inlDateTime_DTM) - DATEPART(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, inlDateTime_DTM), 0)) = 1 THEN 'Week-2' WHEN DATEPART(WEEK, inlDateTime_DTM) - DATEPART(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, inlDateTime_DTM), 0)) = 2 THEN 'Week-3' WHEN DATEPART(WEEK, inlDateTime_DTM) - DATEPART(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, inlDateTime_DTM), 0)) = 3 THEN 'Week-4' ELSE 'Week-5' END AS WeekName, IncidentLog_PRK, dvcName_TXT, ProAlarmType_PRK, IncidentCategory_PRK, inlAlarmMessage_TXT, inlDateTime_DTM, incName_TXT, dvcLatitude_DEC, dvcLongitude_DEC, CameraZone_PRK, cznName_TXT, strName_TXT, bldBuildingName_TXT, untUnitName_TXT, patName_TXT, CASE WHEN inlStatus_FRK = 3 THEN 'Pending' WHEN inlStatus_FRK = 1 THEN 'Open' ELSE 'Closed' END AS Status, CASE WHEN DATEPART(HOUR, inlDateTime_DTM) >= 5 AND DATEPART(HOUR, inlDateTime_DTM) < 12 THEN 'Morning' WHEN DATEPART(HOUR, inlDateTime_DTM) >= 12 AND DATEPART(HOUR, inlDateTime_DTM) < 17 THEN 'Afternoon' WHEN DATEPART(HOUR, inlDateTime_DTM) >= 17 AND DATEPART(HOUR, inlDateTime_DTM) < 21 THEN 'Evening' ELSE 'Night' END AS TimeCategory, FORMAT(inlDateTime_DTM, 'HH') AS HourInterval FROM TEST.dbo.IncidentLog_TBL il LEFT OUTER JOIN TEST.dbo.ProEvent_TBL pe ON il.inlAlarmProEvent_FRK = pe.ProEvent_PRK LEFT OUTER JOIN TEST.dbo.DeviceStateLink_TBL dst ON dst.dstProEvent_FRK = pe.ProEvent_PRK LEFT OUTER JOIN TEST.dbo.Device_TBL d ON d.Device_PRK = dst.dstDevice_FRK LEFT OUTER JOIN TEST.dbo.IncidentCategory_TBL ict ON ict.IncidentCategory_PRK = il.inlCategory_FRK LEFT OUTER JOIN TEST.dbo.CameraZone_TBL czt ON czt.CameraZone_PRK = il.inlZone_FRK LEFT OUTER JOIN TEST.dbo.Street_TBL st ON st.Street_PRK = il.inlStreet_FRK LEFT OUTER JOIN TEST.dbo.Building_TBL b ON b.Building_PRK = il.inlBuilding_FRK LEFT OUTER JOIN TEST.dbo.Unit_TBL ut ON ut.Unit_PRK = il.inlUnit_FRK LEFT OUTER JOIN TEST.dbo.ProAlarmType_TBL pat ON pat.ProAlarmType_PRK = il.inlProAlarmType_FRK LEFT OUTER JOIN TEST.dbo.Camera_TBL ct ON ct.Camera_PRK = d.dvcCamera_FRK WHERE il.inlCategory_FRK IN (2)  and dvcName_TXT not like  '%panel zone 1%' and  cast(inlDateTime_DTM as date) = cast(DATEADD(day, 0, GETDATE()) as date) GROUP BY YEAR(inlDateTime_DTM), MONTH(inlDateTime_DTM), DATENAME(MONTH, inlDateTime_DTM), DATENAME(WEEKDAY, inlDateTime_DTM), DATEPART(WEEK, inlDateTime_DTM), IncidentLog_PRK, dvcName_TXT, ProAlarmType_PRK, IncidentCategory_PRK, inlAlarmMessage_TXT, inlDateTime_DTM, incName_TXT, dvcLatitude_DEC, dvcLongitude_DEC, CameraZone_PRK, cznName_TXT, strName_TXT, bldBuildingName_TXT, untUnitName_TXT, patName_TXT, inlStatus_FRK, DATEPART(HOUR, inlDateTime_DTM) ) SELECT h.HourInterval, COALESCE(a.IncidentLog_PRK, 0) AS IncidentLog_PRK, COALESCE(a.inlAlarmMessage_TXT, '') AS inlAlarmMessage_TXT, COALESCE(a.Status, ' ') AS Status, COALESCE(a.[Total Alarms], 0) AS [Total Alarms], COALESCE(a.[False Alarms], 0) AS [False Alarms], COALESCE(a.[True Alarms], 0) AS [True Alarms], COALESCE(a.[Not Marked], 0) AS [Not Marked], a.Year, a.Month, a.MonthName, a.DayName, a.WeekName, a.dvcName_TXT, a.ProAlarmType_PRK, a.IncidentCategory_PRK, a.incName_TXT, a.dvcLatitude_DEC, a.dvcLongitude_DEC, a.CameraZone_PRK, a.cznName_TXT, a.strName_TXT, a.bldBuildingName_TXT, a.untUnitName_TXT, a.patName_TXT, a.TimeCategory FROM HourIntervals h LEFT JOIN AggregatedData a ON h.HourInterval = a.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  report_query: {
                    name: "Alarm building wise report",
                    query:
                      "SELECT ptsDeviceName_TXT AS 'Device Name', ptsIPAddress_TXT AS 'IP Detail', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG=2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG=1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM [TEST].[dbo].PingTest_TBL JOIN [TEST].[dbo].Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN [TEST].[dbo].Street_TBL ON Street_PRK = ptsStreet_FRK JOIN [TEST].[dbo].CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 3 ORDER BY [Building Name], Region, [Device Name];",
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
                    legends: ["Total", "Online", "Offline"],
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
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23 ) SELECT h.HourInterval, COALESCE(i.IncidentLog_PRK, 0) AS IncidentLog_PRK, COALESCE(i.inlAlarmMessage_TXT, '') AS inlAlarmMessage_TXT, COALESCE(i.Status, ' ') AS Status, COALESCE(i.[False Alarms], 0) AS [Total Alarms], COALESCE(i.[False Alarms], 0) AS [False Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[Not Marked], 0) AS [Not Marked], COALESCE(i.cznName_TXT, '') AS Zone, COALESCE(i.bldBuildingName_TXT, '') AS Building FROM HourIntervals h LEFT JOIN ( SELECT IncidentLog_PRK, inlAlarmMessage_TXT, inlCategory_FRK, SUM(CASE WHEN inlCategory_FRK = 2 THEN 1 ELSE 0 END) AS [Total Alarms], SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms], SUM(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 ELSE 0 END) AS [Not Marked], CASE WHEN inlStatus_FRK = 3 THEN 'Pending' WHEN inlStatus_FRK = 1 THEN 'Open' ELSE 'Closed' END AS Status, FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, z.cznName_TXT, b.bldBuildingName_TXT FROM TEST.dbo.IncidentLog_TBL i LEFT JOIN TEST.dbo.Building_TBL b ON b.Building_PRK = i.inlBuilding_FRK LEFT JOIN TEST.dbo.Street_TBL s ON s.Street_PRK = i.inlStreet_FRK LEFT JOIN TEST.dbo.incidentcategory_tbl ic ON ic.incidentcategory_prk = i.inlCategory_FRK LEFT JOIN TEST.dbo.Device_TBL d ON d.Device_PRK = i.inlSourceDevice_FRK LEFT JOIN TEST.dbo.NVRChannel_TBL n ON n.NVRChannel_PRK = d.dvcNvrChannel_FRK LEFT JOIN TEST.dbo.Camera_TBL c ON c.Camera_PRK = n.nchCamera_FRK LEFT JOIN TEST.dbo.CameraZone_TBL z ON z.CameraZone_PRK = i.inlZone_FRK WHERE i.inlCategory_FRK = 2 AND CAST(i.inlDateTime_DTM AS DATE) = CAST(GETDATE() AS DATE) GROUP BY i.IncidentLog_PRK, i.inlAlarmMessage_TXT, i.inlCategory_FRK, i.inlStatus_FRK, FORMAT(i.inlDateTime_DTM, 'HH'), z.cznName_TXT, b.bldBuildingName_TXT ) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                    legends: ["Total Alarms", "False Alarms", "True Alarms"],
                  },
                  drill_down_query: {
                    name: "Hourly Trend NCR-1",
                    query:
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23 ) SELECT h.HourInterval, COALESCE(i.IncidentLog_PRK, 0) AS IncidentLog_PRK, COALESCE(i.inlAlarmMessage_TXT, '') AS inlAlarmMessage_TXT, COALESCE(i.Status, ' ') AS Status, COALESCE(i.[False Alarms], 0) AS [False Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[Not Marked], 0) AS [Not Marked], COALESCE(i.cznName_TXT, '') AS Zone, COALESCE(i.bldBuildingName_TXT, '') AS Building FROM HourIntervals h LEFT JOIN ( SELECT IncidentLog_PRK, inlAlarmMessage_TXT, inlCategory_FRK, SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms], SUM(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 ELSE 0 END) AS [Not Marked], CASE WHEN inlStatus_FRK = 3 THEN 'Pending' WHEN inlStatus_FRK = 1 THEN 'Open' ELSE 'Closed' END AS Status, FORMAT(i.inlDateTime_DTM, 'HH') AS HourInterval, z.cznName_TXT, b.bldBuildingName_TXT FROM Test.dbo.IncidentLog_TBL i LEFT JOIN Test.dbo.Building_TBL b ON b.Building_PRK = i.inlBuilding_FRK LEFT JOIN Test.dbo.Street_TBL s ON s.Street_PRK = i.inlStreet_FRK LEFT JOIN Test.dbo.incidentcategory_tbl ic ON ic.incidentcategory_prk = i.inlCategory_FRK LEFT JOIN Test.dbo.Device_TBL d ON d.Device_PRK = i.inlSourceDevice_FRK LEFT JOIN Test.dbo.NVRChannel_TBL n ON n.NVRChannel_PRK = d.dvcNvrChannel_FRK LEFT JOIN Test.dbo.Camera_TBL c ON c.Camera_PRK = n.nchCamera_FRK LEFT JOIN Test.dbo.CameraZone_TBL z ON z.CameraZone_PRK = i.inlZone_FRK WHERE i.inlCategory_FRK = 2 AND CAST(i.inlDateTime_DTM AS DATE) = CAST(GETDATE() AS DATE) GROUP BY i.IncidentLog_PRK, i.inlAlarmMessage_TXT, i.inlCategory_FRK, i.inlStatus_FRK, FORMAT(i.inlDateTime_DTM, 'HH'), z.cznName_TXT, b.bldBuildingName_TXT ) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
                    legends: ["True Alarms", "False Alarms"],
                  },
                  report_query: {
                    name: "Hourly Trend Alarm",
                    query:
                      "WITH HourIntervals AS ( SELECT FORMAT(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1, '00') AS HourInterval FROM master..spt_values WHERE type = 'P' AND number BETWEEN 0 AND 23  -- Adjusted to 0-23 for a 24-hour format ) SELECT h.HourInterval, COALESCE(i.IncidentLog_PRK, 0) AS IncidentLog_PRK, COALESCE(i.inlAlarmMessage_TXT, '') AS inlAlarmMessage_TXT, COALESCE(i.Status, ' ') AS Status, -- Alarm counts from the aggregated subquery COALESCE(i.[False Alarms], 0) AS [False Alarms], COALESCE(i.[True Alarms], 0) AS [True Alarms], COALESCE(i.[Not Marked], 0) AS [Not Marked] FROM HourIntervals h LEFT JOIN ( SELECT IncidentLog_PRK, inlAlarmMessage_TXT, inlCategory_FRK, -- Alarm counts SUM(CASE WHEN inlSubCategory_FRK = 1 THEN 1 ELSE 0 END) AS [False Alarms], SUM(CASE WHEN inlSubCategory_FRK = 2 THEN 1 ELSE 0 END) AS [True Alarms], SUM(CASE WHEN inlSubCategory_FRK IS NULL THEN 1 ELSE 0 END) AS [Not Marked], -- Status CASE WHEN inlStatus_FRK = 3 THEN 'Pending' WHEN inlStatus_FRK = 1 THEN 'Open' ELSE 'Closed' END AS Status, -- HourInterval for grouping and joining FORMAT(inlDateTime_DTM, 'HH') AS HourInterval FROM Test.dbo.IncidentLog_TBL WHERE inlCategory_FRK IN (2)  -- Filter based on specific Incident Category GROUP BY IncidentLog_PRK, inlAlarmMessage_TXT, inlCategory_FRK, inlStatus_FRK, FORMAT(inlDateTime_DTM, 'HH') ) i ON h.HourInterval = i.HourInterval ORDER BY CAST(h.HourInterval AS INT);",
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
