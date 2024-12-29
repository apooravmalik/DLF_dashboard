// src/context/AppContext.js
import { createContext, useState } from "react";
import PropTypes from "prop-types";

// Create context
export const AppContext = createContext();

// Create the provider for the context
export const AppProvider = ({ children }) => {
  const [queries, setQueries] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [chartData, setChartData] = useState([]); // Store chart data as an array of selected charts

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

// Prop types to ensure proper usage of the provider
AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
