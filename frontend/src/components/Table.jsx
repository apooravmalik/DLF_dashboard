import PropTypes from "prop-types";

const Table = ({ columns, data }) => {
  return (
    <table className="table-auto w-full bg-gray-800 text-white border border-gray-700">
      <thead>
        {/* Total Rows Row at the Top */}
        <tr className="bg-gray-700 font-bold">
          <td className="px-4 py-2 border border-gray-700" colSpan={columns.length + 1}>
            Total Rows: {data.length}
          </td>
        </tr>

        {/* Column Headers */}
        <tr>
          <th className="px-4 py-2 border border-gray-700">S.No.</th>
          {columns.map((column) => (
            <th key={column} className="px-4 py-2 border border-gray-700">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Data Rows */}
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="px-4 py-2 border border-gray-700">{rowIndex + 1}</td>
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
