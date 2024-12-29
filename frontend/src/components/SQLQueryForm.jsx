import { useState } from 'react';
import PropTypes from 'prop-types';

const SQLQueryForm = ({ onSubmit }) => {
  const [queries, setQueries] = useState([""]);

  const handleInputChange = (index, value) => {
    const updatedQueries = [...queries];
    updatedQueries[index] = value;
    setQueries(updatedQueries);
  };

  const addQuery = () => {
    setQueries([...queries, ""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(queries.filter((query) => query.trim() !== ""));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Enter SQL Queries:</h2>
      {queries.map((query, index) => (
        <div key={index} className="space-y-2">
          <label className="block text-sm font-medium">
            Query {index + 1}:
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Enter SQL Query ${index + 1}`}
            className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={addQuery}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Add Query
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Generate Report
        </button>
      </div>
    </form>
  );
};

SQLQueryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SQLQueryForm;
