import PropTypes from "prop-types";

const Table = ({ columns, data }) => {
  return (
    <table className="table-auto w-full bg-gray-800 text-white border border-gray-700">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-4 py-2 border border-gray-700">
              <span>{column}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column} className="px-4 py-2 border border-gray-700">
                {row[column] || "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default Table;
