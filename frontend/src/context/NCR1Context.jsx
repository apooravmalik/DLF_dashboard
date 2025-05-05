// NCR1Context.js
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from "../config/config";

export const NCR1Context = createContext();

export function NCR1Provider ({ children }) {
  // State for admin workflows
  const [queries, setQueries] = useState([]);
  const [queryResults, setQueryResults] = useState([]);

  // State for client workflows
  const [chartsData, setChartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchData = async () => {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/dashboard/charts`,
        {
          "dashboard_id": "NCR1",
          charts: [
            {
              name: "Recorder Status",
              queries: {
                overview_query: {
                  name: "Recorder Status",
                  query:
                    "SELECT COUNT(*) AS 'Total', SUM(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL WHERE ptsCameraZone_FRK = 3 AND (PingTest_PRK NOT BETWEEN 603 AND 786) AND (PingTest_PRK NOT BETWEEN 800 AND 806) AND (PingTest_PRK NOT BETWEEN 882 AND 888);",
                  legends: ["Total", "Online", "Offline"],
                },
                drill_down_query: {
                  name: "Recorder Status Building Wise",
                  query:
                    "SELECT bldBuildingName_TXT AS 'Building Name', SUM(CASE WHEN pts.ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN pts.ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL pts JOIN Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 3 AND (PingTest_PRK NOT BETWEEN 603 AND 786) AND (PingTest_PRK NOT BETWEEN 800 AND 806) AND (PingTest_PRK NOT BETWEEN 882 AND 888) GROUP BY bldBuildingName_TXT ORDER BY [Building Name];",
                  legends: ["Building Name", "Online", "Offline"],
                },
                report_query: {
                  name: "Recorder Status Building Wise Report",
                  query:
                    "SELECT ptsDeviceName_TXT AS 'Device Name', ptsIPAddress_TXT AS 'IP Detail', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', CASE WHEN ptsDeviceName_TXT LIKE '%DVR%' THEN 'DVR' WHEN ptsDeviceName_TXT LIKE '%NVR%' THEN 'NVR' ELSE 'Unknown' END AS 'Device Type', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG = 2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG = 1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM [TEST].[dbo].PingTest_TBL JOIN [TEST].[dbo].Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN [TEST].[dbo].Street_TBL ON Street_PRK = ptsStreet_FRK JOIN [TEST].[dbo].CameraZone_TBL ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 3 AND PingTest_PRK NOT BETWEEN 158 AND 167 AND PingTest_PRK NOT BETWEEN 603 AND 786 AND PingTest_PRK NOT BETWEEN 800 AND 806 AND PingTest_PRK NOT BETWEEN 882 AND 883 AND ptsDeviceName_TXT NOT LIKE '%GGN%' ORDER BY [Building Name], Region, [Device Name];",
                },
              },
            },           
            {
              name: "Camera Status",
              queries: {
                overview_query: {
                  name: "Camera Status",
                  query:
                    "SELECT COUNT(*) AS Total, SUM(CASE WHEN nc.ConnectionStatus = 1 THEN 1 ELSE 0 END) AS Online, SUM(CASE WHEN nc.ConnectionStatus = 0 THEN 1 ELSE 0 END) AS Offline FROM Veracity_Middleware_DB.dbo.NVRChannels nc JOIN Device_TBL dt ON nc.ID = dt.dvcNvrChannel_FRK WHERE dt.dvcZone_FRK = 3;",
                  legends: ["Total", "Online", "Offline"],
                },
				drill_down_query: {
                  name: "Camera Building wise Status",
                  query:
                    "SELECT bt.bldBuildingName_TXT AS BuildingName, SUM(CASE WHEN nvr.ConnectionStatus = 1 AND nc.ConnectionStatus = 1 THEN 1 ELSE 0 END) AS Online, SUM(CASE WHEN (nvr.ConnectionStatus = 1 AND nc.ConnectionStatus = 0) OR (nvr.ConnectionStatus = 0 AND nc.ConnectionStatus IN (1, 0)) THEN 1 ELSE 0 END) AS Offline FROM Device_TBL dt JOIN NVRChannel_TBL nct ON nct.NVRChannel_PRK = dt.dvcNvrChannel_FRK JOIN Camera_TBL ct ON ct.Camera_PRK = nct.nchCamera_FRK JOIN CameraZone_TBL czt ON czt.CameraZone_PRK = dt.dvcZone_FRK JOIN Street_TBL st ON st.Street_PRK = dt.dvcStreet_FRK JOIN Building_TBL bt ON bt.Building_PRK = dt.dvcBuilding_FRK JOIN Veracity_Middleware_DB.dbo.NVRChannels nc ON nc.ID = nct.NVRChannel_PRK JOIN Veracity_Middleware_DB.dbo.NVR nvr ON nvr.ID = nc.NvrID WHERE dt.dvcZone_FRK = 3 GROUP BY bt.bldBuildingName_TXT ORDER BY bt.bldBuildingName_TXT;",
                  legends: ["Total", "Online", "Offline"],
                },
                report_query: {
                  name: "Camera Status Report",
                  query:
                    "SELECT CASE WHEN LEFT(dvcName_TXT, 3) = 'Cam' THEN STUFF(dvcName_TXT, 1, 3, '') ELSE dvcName_TXT END AS 'Device Name', NVR.ipAddress AS 'IP Detail', NVRChannel_TBL.nchChannelNumber_LNG AS 'Device Channel', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', nvrAlias_TXT as 'Recorder Name', CASE WHEN NVRChannels.ConnectionStatus = 0 THEN NVRChannels.ModificationDate ELSE NULL END AS 'Offline Date Time', CASE WHEN NVRChannels.ConnectionStatus = 0 THEN 'Offline' WHEN NVRChannels.ConnectionStatus = 1 THEN 'Online' ELSE 'Unknown' END AS 'Status', CASE WHEN NVRChannels.ConnectionStatus = 0 AND NVRChannels.ModificationDate IS NOT NULL THEN DATEDIFF(HOUR, NVRChannels.ModificationDate, GETDATE()) ELSE NULL END AS 'Down Time (hours)' FROM Device_TBL JOIN NVRChannel_TBL ON NVRChannel_PRK = dvcNvrChannel_FRK JOIN Camera_TBL ON Camera_PRK = nchCamera_FRK JOIN CameraZone_TBL ON CameraZone_PRK = dvcZone_FRK JOIN Street_TBL ON Street_PRK = dvcStreet_FRK JOIN Building_TBL ON Building_PRK = dvcBuilding_FRK JOIN Veracity_Middleware_DB.dbo.NVRChannels ON NVRChannels.ID = NVRChannel_PRK JOIN Veracity_Middleware_DB.dbo.NVR ON NVR.ID = NvrID join NVR_TBL on nchNVR_FRK=NVR_PRK WHERE dvcZone_FRK = 3 AND dvcName_TXT NOT LIKE '%GGN%' ORDER BY [Building Name], [Region], [Device Name];",
                },
              },
            },
			{
              name: "ACS Controller Status",
              queries: {
                overview_query: {
                  name: "ACS Controller Status",
                  query:
                    "SELECT COUNT(*) AS 'Total', SUM(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL WHERE ptsCameraZone_FRK = 3 AND (PingTest_PRK BETWEEN 603 AND 786 OR PingTest_PRK BETWEEN 882 AND 888);",
                  legends: ["Total", "Online", "Offline"],
                },
				drill_down_query: {
                  name: "ACS Controller Building wise Status",
                  query:
                    "SELECT bld.bldBuildingName_TXT AS 'Building Name', SUM(CASE WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0 END) AS 'Online', SUM(CASE WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0 END) AS 'Offline' FROM PingTest_TBL pts JOIN Building_TBL bld ON Building_PRK = ptsBuilding_FRK JOIN Street_TBL st ON Street_PRK = ptsStreet_FRK JOIN CameraZone_TBL cz ON CameraZone_PRK = ptsCameraZone_FRK WHERE ptsCameraZone_FRK = 3 AND (PingTest_PRK BETWEEN 603 AND 786 OR PingTest_PRK BETWEEN 882 AND 888) GROUP BY bldBuildingName_TXT ORDER BY [Building Name];",
                  legends: ["Total", "Online", "Offline"],
                },
                report_query: {
                  name: "ACS Controller Status Report",
                  query:
                    "SELECT ptsDeviceName_TXT AS 'Device Name', ptsIPAddress_TXT AS 'IP Detail', strName_TXT AS 'Region', bldBuildingName_TXT AS 'Building Name', ptsOfflineTime_DTM AS 'Offline Date Time', CASE WHEN ptsCurrentState_LNG = 2 AND ptsOfflineTime_DTM IS NOT NULL THEN 'Offline' WHEN ptsCurrentState_LNG = 1 THEN 'Online' END AS Status, DATEDIFF(HH, ptsOfflineTime_DTM, GETDATE()) AS 'Down Time (hours)' FROM PingTest_TBL JOIN Building_TBL ON Building_PRK = ptsBuilding_FRK JOIN Street_TBL ON Street_PRK = ptsStreet_FRK WHERE ptsCameraZone_FRK = 3 AND (PingTest_PRK BETWEEN 603 AND 786 OR PingTest_PRK BETWEEN 882 AND 888);",
                },
              },
            },
            {
              name: "Flap Barrier Status",
              queries: {
                overview_query: {
                  name: "Flap Barrier Status",
                  query:
                    "SELECT SUM(COALESCE([Online], 0)) + SUM(COALESCE([Offline], 0)) AS Total, SUM(COALESCE([Online], 0)) AS Online, SUM(COALESCE([Offline], 0)) AS Offline FROM (SELECT bldBuildingName_TXT AS 'Building Name', COALESCE([Online], 0) AS [Online], COALESCE([Offline], 0) AS [Offline] FROM (SELECT bldBuildingName_TXT, CASE WHEN dvcCurrentState_TXT IN ('ACCESS GRANTED', 'ACCESS DENIED', 'NEW ONE UNKNOWN CARD', 'Door Left Open', 'Door open too long', 'Door Forced Open', 'Door Close', 'Door Open', 'Online', 'VOID', 'UNKNOWN') THEN 'Online' WHEN dvcCurrentState_TXT = 'Offline' THEN 'Offline' ELSE 'Online' END AS Status, Device_PRK FROM Device_TBL LEFT JOIN Building_TBL ON dvcBuilding_FRK = Building_PRK WHERE dvcDeviceType_FRK = 22 AND dvcName_TXT LIKE '%Siemens%') AS SourceTable PIVOT (COUNT(Device_PRK) FOR Status IN ([Online], [Offline])) AS PivotTable) AS Totals;",
				  legends: ["Total", "Online", "Offline"],
                },
                drill_down_query: {
					name: "Flap Barrier Building wise Status",
					query:
					  "SELECT BuildingLabel AS [Building Name], COALESCE([Online], 0) AS [Online], COALESCE([Offline], 0) AS [Offline], COALESCE([Online], 0) + COALESCE([Offline], 0) AS [Total] FROM (SELECT CASE WHEN dvcName_TXT LIKE '%ggn_bldg-10%' THEN 'Building 10' WHEN dvcName_TXT LIKE '%ggn_bldg-8%' THEN 'Building 8' WHEN dvcName_TXT LIKE '%ggn_bldg-5%' THEN 'Building 5' WHEN dvcName_TXT LIKE '%ggn_bldg-6%' THEN 'Building 6' WHEN dvcName_TXT LIKE '%ggn_bldg-7%' THEN 'Building 7' WHEN dvcName_TXT LIKE '%ggn_bldg-9%' THEN 'Building 9' WHEN dvcName_TXT LIKE '%ggn_bldg-14%' THEN 'Building 14' WHEN dvcName_TXT LIKE '%ggn_gateway%' THEN 'GatewayTower' WHEN dvcName_TXT LIKE '%ggn_cyber%' THEN 'Cyber Green' WHEN dvcName_TXT LIKE '%ggn_infinity%' THEN 'Infinity' ELSE 'Other' END AS BuildingLabel, CASE WHEN dvcCurrentState_TXT IN ('ACCESS GRANTED', 'ACCESS DENIED', 'NEW ONE UNKNOWN CARD', 'Door Left Open', 'Door open too long', 'Door Forced Open', 'Door Close', 'Door Open', 'Online', 'VOID', 'UNKNOWN') THEN 'Online' WHEN dvcCurrentState_TXT = 'Offline' THEN 'Offline' ELSE 'Online' END AS Status, Device_PRK FROM Device_TBL WHERE dvcDeviceType_FRK = 22 AND dvcName_TXT LIKE '%ggn_bldg-%') AS SourceTable PIVOT (COUNT(Device_PRK) FOR Status IN ([Online], [Offline])) AS PivotTable ORDER BY [Building Name];"
				},
                report_query: {
                  name: "Flap Barrier Status Report",
                  query:
                    "SELECT dvcName_TXT AS [Device Name], dvcIPAddress_TXT AS [IP Detail], 'RJOC 10 A' AS [Region], CASE WHEN dvcName_TXT LIKE '%ggn_bldg-10%' THEN 'Building 10' WHEN dvcName_TXT LIKE '%ggn_bldg-14%' THEN 'Building 14' WHEN dvcName_TXT LIKE '%ggn_bldg-5%' THEN 'Building 5' WHEN dvcName_TXT LIKE '%ggn_bldg-6%' THEN 'Building 6' WHEN dvcName_TXT LIKE '%ggn_bldg-7%' THEN 'Building 7' WHEN dvcName_TXT LIKE '%ggn_bldg-8%' THEN 'Building 8' WHEN dvcName_TXT LIKE '%ggn_bldg-9%' THEN 'Building 9' WHEN dvcName_TXT LIKE '%CG%' OR dvcName_TXT LIKE '%Cyber Green%' THEN 'Cyber Green' WHEN dvcName_TXT LIKE '%GatewayTower%' THEN 'GatewayTower' WHEN dvcName_TXT LIKE '%Infinity%' THEN 'Infinity' ELSE 'Unknown' END AS [Building Name], CASE WHEN dvcCurrentState_TXT = 'Offline' THEN dvcCurrentStateSetTime_DTM ELSE NULL END AS [Offline Date Time], CASE WHEN dvcCurrentState_TXT = 'Offline' THEN 'Offline' ELSE 'Online' END AS [Status], CASE WHEN dvcCurrentState_TXT = 'Offline' THEN DATEDIFF(HOUR, dvcCurrentStateSetTime_DTM, GETDATE()) ELSE NULL END AS [Down Time (hours)] FROM Device_TBL WHERE dvcDeviceType_FRK = 22 AND (dvcName_TXT LIKE '%ggn_bldg-10%' OR dvcName_TXT LIKE '%ggn_bldg-14%' OR dvcName_TXT LIKE '%ggn_bldg-5%' OR dvcName_TXT LIKE '%ggn_bldg-6%' OR dvcName_TXT LIKE '%ggn_bldg-7%' OR dvcName_TXT LIKE '%ggn_bldg-8%' OR dvcName_TXT LIKE '%ggn_bldg-9%' OR dvcName_TXT LIKE '%CG%' OR dvcName_TXT LIKE '%GatewayTower%' OR dvcName_TXT LIKE '%Infinity%');",
                },
              },
            },
          ],
        },
      );
      setChartsData(response.data.charts);
      setLoading(false);

      // Calculate next refresh time
      const nextRefresh = new Date(Date.now() + (config.REFRESH_INTERVAL || 300000));
      console.log("Next refresh at:", nextRefresh.toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
	} finally {
		setLoading(false);
	}
  };

  // Fetch chart data for client
  useEffect(() => {
    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData();
    }, config.REFRESH_INTERVAL || 300000); // Refresh every 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <NCR1Context.Provider
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
    </NCR1Context.Provider>
  );
};

NCR1Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
