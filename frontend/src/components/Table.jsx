// Table.jsx
import PropTypes from 'prop-types';

const Table = ({ columns, data, onCheckboxChange, selectedAttributes, handleColorChange, colorSelections }) => {
  const colorOptions = ["Red", "Green", "Blue"];

  return (
    <table className="table-auto w-full bg-gray-800 text-white border border-gray-700">
      <thead>
        <tr>
          <th className="px-4 py-2 border border-gray-700">
            <span>Select Row</span>
          </th>
          {columns.map((column) => (
            <th key={column} className="px-4 py-2 border border-gray-700">
              <span>{column}</span>
            </th>
          ))}
          <th className="px-4 py-2 border border-gray-700">
            <span>Color</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="px-4 py-2 border border-gray-700">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-[#2196F3] rounded focus:ring-[#1976D2]"
                checked={selectedAttributes.has(row.attribute)} // Check if the attribute is selected
                onChange={() => onCheckboxChange(row.attribute)} // Pass the attribute for selection
              />
            </td>
            {columns.map((column) => (
              <td key={column} className="px-4 py-2 border border-gray-700">
                {row[column]}
              </td>
            ))}
            <td className="px-4 py-2 border border-gray-700">
              <select
                className="form-select bg-gray-800 text-white"
                onChange={(e) => handleColorChange(row.attribute, e.target.value)}
                value={colorSelections[`${rowIndex}-${row.attribute}`] || "Red"}
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onCheckboxChange: PropTypes.func.isRequired, // Required to handle row selection
  selectedAttributes: PropTypes.instanceOf(Set).isRequired, // Should be a Set to track selected rows
  handleColorChange: PropTypes.func.isRequired, // Required to handle color change
  colorSelections: PropTypes.object.isRequired, // Store selected colors
};

export default Table;
