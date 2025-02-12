import PropTypes from "prop-types";

const Table = ({ columns, data }) => {
  return (
    <table className="table-auto w-full bg-[#3E4B57] text-white border border-[#4A5A68]">
      <thead>
        {/* Total Rows Row at the Top */}
        <tr className="bg-[#2C3945] font-bold text-white">
          <td className="px-4 py-2 border border-[#4A5A68]" colSpan={columns.length + 1}>
            Total Rows: {data.length}
          </td>
        </tr>

        {/* Column Headers */}
        <tr className="bg-[#25323E] text-gray-300">
          <th className="px-4 py-2 border border-[#4A5A68]">S.No.</th>
          {columns.map((column) => (
            <th key={column} className="px-4 py-2 border border-[#4A5A68]">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Data Rows */}
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`${
              rowIndex % 2 === 0 ? "bg-[#3A4855]" : "bg-[#313D48]"
            } hover:bg-[#4A5A68] transition-colors`}
          >
            <td className="px-4 py-2 border border-[#4A5A68]">{rowIndex + 1}</td>
            {columns.map((column) => (
              <td key={column} className="px-4 py-2 border border-[#4A5A68]">
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
