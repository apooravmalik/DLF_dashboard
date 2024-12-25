import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [queries, setQueries] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], dataPoints: [] });

  return (
    <AppContext.Provider
      value={{
        queries,
        setQueries,
        queryResults,
        setQueryResults,
        chartData,
        setChartData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
