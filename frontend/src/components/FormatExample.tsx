// Example data for Traditional format
const exampleData = {
  headers: [
    "Name",
    "1st Aff",
    "1st Neg",
    "2nd Aff",
    "2nd Neg",
    "3rd Aff",
    "3rd Neg",
    "Group",
  ],
  rows: [
    { name: "A", preferences: [1, 2, 3, 4, 5, 6], group: "11am" },
    { name: "B", preferences: [5, 4, 3, 2, 1, 6], group: "" },
    { name: "C", preferences: [6, 5, 4, 3, 2, 1], group: "11am,2pm" },
  ],
};

export default function FormatExample() {
  const handleDownloadCSV = () => {
    const csvLines: string[] = [];

    // Add header
    csvLines.push(exampleData.headers.join(","));

    // Add data rows
    for (const row of exampleData.rows) {
      const group = row.group.includes(",") ? `"${row.group}"` : row.group;
      const rowData = [row.name, ...row.preferences, group];
      csvLines.push(rowData.join(","));
    }

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "example_traditional.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Example (Traditional Format):
        </h3>
        <button
          onClick={handleDownloadCSV}
          className="text-sm bg-gray-600 dark:bg-gray-700 text-white py-1 px-3 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          Download Example CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              {exampleData.headers.map((header, idx) => (
                <th
                  key={idx}
                  className="text-center py-2 px-3 text-gray-900 dark:text-gray-100 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exampleData.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                  {row.name}
                </td>
                {row.preferences.map((pref, prefIdx) => (
                  <td
                    key={prefIdx}
                    className="py-2 px-3 text-gray-700 dark:text-gray-300"
                  >
                    {pref}
                  </td>
                ))}
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                  {row.group}
                </td>
              </tr>
            ))}
            <tr>
              <td
                className="py-2 px-3 text-gray-500 dark:text-gray-500 italic"
                colSpan={exampleData.headers.length}
              >
                ... (more participants)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Each number represents the participant's preference ranking for that
        role (1 = most preferred, 6 = least preferred).
      </p>
    </div>
  );
}
