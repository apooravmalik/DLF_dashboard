// AppContext.js
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../config/config";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State for admin workflows
  const [queries, setQueries] = useState([]);
  const [queryResults, setQueryResults] = useState([]);

  // State for client workflows
  const [chartsData, setChartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chart data for client
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${config.API_BASE_URL}/api/dashboard/charts`,
          {
            charts: [
              {
                overview_query:
                  "SELECT COUNT(*) AS 'Total', SUM (CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM (CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL WHERE ptsCameraZone_FRK = 3",
                drill_down_query:
                  "SELECT bld.bldBuildingName_TXT AS 'Building Name', SUM(CASE WHEN pts.ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN pts.ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL pts JOIN Building_TBL bld ON bld.Building_PRK = pts.ptsBuilding_FRK JOIN Street_TBL st ON st.Street_PRK = pts.ptsStreet_FRK JOIN CameraZone_TBL cz ON cz.CameraZone_PRK = pts.ptsCameraZone_FRK WHERE pts.ptsCameraZone_FRK = 3 GROUP BY bld.bldBuildingName_TXT ORDER BY [Building Name]",
                report_query:
                  "SELECT ptsDeviceName_TXT AS 'Device Name', ptsIPAddress_TXT AS 'IP Detail', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG=2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG=1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM PingTest_TBL JOIN Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN Street_TBL ON Street_PRK = ptsStreet_FRK JOIN CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 3 ORDER BY [Building Name], Region, [Device Name]",
              },
              {
                overview_query:
                  "SELECT COUNT (*) AS 'Total', SUM (CASE WHEN ConnectionStatus = 1 THEN 1 ELSE 0 END) AS 'Online', SUM (CASE WHEN ConnectionStatus = 0 THEN 1 ELSE 0 END) AS 'Offline' FROM Veracity_Middleware_DB.dbo.NVRChannels JOIN TEST.dbo.Device_TBL ON dvcNvrChannel_FRK = ID JOIN TEST.dbo.NVRChannel_TBL ON NVRChannel_PRK = dvcNvrChannel_FRK JOIN TEST.dbo.Camera_TBL ON Camera_PRK = nchCamera_FRK JOIN TEST.dbo.GeoRollupCameraLink_TBL ON Camera_PRK = gclCamera_FRK",
                drill_down_query:
                  "SELECT bldBuildingName_TXT AS 'Building Name', SUM(CASE WHEN ConnectionStatus = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN ConnectionStatus = 0 THEN 1 ELSE 0 END) AS 'Offline' FROM Veracity_Middleware_DB.dbo.NVRChannels JOIN TEST.dbo.Device_TBL ON dvcNvrChannel_FRK = ID JOIN TEST.dbo.NVRChannel_TBL ON NVRChannel_PRK = dvcNvrChannel_FRK JOIN TEST.dbo.Camera_TBL ON Camera_PRK = nchCamera_FRK JOIN TEST.dbo.GeoRollupCameraLink_TBL ON Camera_PRK = gclCamera_FRK JOIN TEST.dbo.Building_TBL ON Building_PRK = gclBuilding_FRK WHERE gclZone_FRK = 3 GROUP BY bldBuildingName_TXT ORDER BY [Building Name]",
                report_query:
                  "SELECT NVR.Name AS 'NVR Name', NVRChannels.Name AS 'Camera Name', ChannelNumber AS 'Channel Number', CASE WHEN NVRChannels.ConnectionStatus = 1 THEN 'Online' WHEN NVRChannels.ConnectionStatus = 0 THEN 'Offline' END AS 'Camera Status', bldBuildingName_TXT AS 'Building Name' FROM Veracity_Middleware_DB.dbo.NVRChannels JOIN Veracity_Middleware_DB.dbo.NVR ON NVR.ID = NVRID JOIN TEST.dbo.Device_TBL ON dvcNvrChannel_FRK = NVRChannels.ID JOIN TEST.dbo.NVRChannel_TBL ON NVRChannel_PRK = dvcNvrChannel_FRK JOIN TEST.dbo.Camera_TBL ON Camera_PRK = nchCamera_FRK JOIN TEST.dbo.GeoRollupCameraLink_TBL ON Camera_PRK = gclCamera_FRK JOIN TEST.dbo.Building_TBL ON Building_PRK = gclBuilding_FRK WHERE gclZone_FRK = 3 ORDER BY NVR.ID",
              },
              {
                overview_query:
                  "SELECT bldBuildingName_TXT AS 'Building Name',COALESCE(Online, 0) + COALESCE(Offline, 0) AS 'Total', COALESCE(Online, 0) AS 'Online', COALESCE(Offline, 0) AS 'Offline' FROM ( SELECT bldBuildingName_TXT, CASE WHEN dvcCurrentState_TXT IS NOT NULL AND dvcCurrentStateSetTime_DTM IS NOT NULL THEN 'Online' ELSE 'Online' END AS Status, Device_PRK FROM Device_TBL LEFT JOIN Building_TBL ON dvcBuilding_FRK = Building_PRK WHERE dvcDeviceType_FRK = 22 and dvcStreet_FRK=8 AND dvcName_TXT NOT LIKE '%NA%' and Device_PRK in (5194,5195,5196,5197,5198,5199,5200,5201,5202,5203,5204,5205,5206,5207,5208,5209,5210,5211,5212,5213,5214,5215,5216,5215,5216,5219,5220,5221,5222,5223,5224) ) AS SourceTable PIVOT ( COUNT(Device_PRK) FOR Status IN ([Online], [Offline]) ) AS PivotTable ORDER BY bldBuildingName_TXT;",
                drill_down_query: null,
                report_query:
                  "SELECT dvcName_TXT AS 'Device Name', CASE WHEN dvcCurrentState_TXT IS NOT NULL THEN dvcCurrentState_TXT ELSE 'Unknown' END AS 'Current State', CASE WHEN dvcCurrentState_TXT IS NOT NULL THEN DATEDIFF(HOUR,dvcCurrentStateSetTime_DTM,GETDATE()) ELSE '0' END AS 'Updated Since', CASE WHEN dvcCurrentState_TXT IS NOT NULL AND dvcCurrentStateSetTime_DTM IS NOT NULL THEN 'Online' ELSE 'Offline' END AS 'Status' FROM Device_TBL WHERE dvcDeviceType_FRK = 22 AND dvcStreet_FRK = 8  and Device_PRK in (5194,5195,5196,5197,5198,5199,5200,5201,5202,5203,5204,5205,5206,5207,5208,5209,5210,5211,5212,5213,5214,5215,5216,5215,5216,5219,5220,5221,5222,5223,5224) AND dvcName_TXT NOT LIKE '%NA%' ORDER BY [Device Name]",
              },
              {
                overview_query:
                  "WITH STATUS AS ( SELECT COUNT(*) AS 'Total', SUM (CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM (CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline', SUM (CASE WHEN ptsCurrentState_LNG = 3 THEN 1 ELSE 0 END) AS 'Unknown' FROM PingTest_TBL WHERE ptsCameraZone_FRK IS NULL UNION SELECT COUNT(*) AS 'Total', SUM (CASE WHEN dvcCurrentState_TXT LIKE '%Online%' THEN 1 ELSE 0 END) AS 'Online', SUM (CASE WHEN dvcCurrentState_TXT LIKE '%Offline%' THEN 1 ELSE 0 END) AS 'Offline', SUM (CASE WHEN dvcCurrentState_TXT LIKE '%@%' THEN 1 ELSE 0 END) AS 'Unknown' FROM Device_TBL WHERE dvcDeviceType_FRK = 22 AND dvcName_TXT like '%ACS%' AND NOT Device_PRK IN (5134,5160,5162,5167,5176,5189,5192,5148,5150) AND dvcStreet_FRK=8 ) SELECT SUM(Total) AS 'Total', SUM(Online) AS 'Online', SUM(Offline) AS 'Offline' FROM STATUS",
                drill_down_query: null,
                report_query:
                  "SELECT ptsDeviceName_TXT AS 'Device Name', CASE WHEN ptsCurrentState_LNG = 1 THEN 'Online' WHEN ptsCurrentState_LNG = 2 THEN 'Offline' END AS  'Status' FROM PingTest_TBL WHERE ptsCameraZone_FRK IS NULL",
              },
            ],
          }
        );
        setChartsData(response.data.charts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppContext.Provider
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
