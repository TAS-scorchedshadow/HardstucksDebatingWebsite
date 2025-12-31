// Example data for debate formats

// Traditional format example
const traditionalExample = {
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

// British Parliamentary format example
const bpExample = {
  headers: ["Name", "PM", "LO", "DPM", "DLO", "GM", "MO", "GW", "OW", "Group"],
  rows: [
    { name: "A", preferences: [1, 2, 3, 4, 5, 6, 7, 8], group: "" },
    { name: "B", preferences: [7, 6, 5, 4, 3, 2, 1, 8], group: "" },
    { name: "C", preferences: [8, 7, 6, 5, 4, 3, 2, 1], group: "morning" },
  ],
};

type ExampleData = {
  headers: string[];
  rows: Array<{ name: string; preferences: number[]; group: string }>;
};

// Shared download handler
function handleDownloadCSV(exampleData: ExampleData, filename: string): void {
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
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

type ExampleTableProps = {
  title: string;
  exampleData: ExampleData;
  filename: string;
};

function ExampleTable({ title, exampleData, filename }: ExampleTableProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <button
          onClick={() => handleDownloadCSV(exampleData, filename)}
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
    </div>
  );
}

export default function FormatExamples() {
  return (
    <div className="space-y-6">
      <ExampleTable
        title="Example (Traditional Format):"
        exampleData={traditionalExample}
        filename="example_traditional.csv"
      />

      <ExampleTable
        title="Example (British Parliamentary Format):"
        exampleData={bpExample}
        filename="example_bp.csv"
      />
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Input Format Clarifications
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2  text-left">
          <li>
            <span className="font-medium">Preferences:</span> Each number
            represents a ranking (1 = most preferred, higher numbers = less
            preferred)
          </li>
          <li>
            <span className="font-medium">Empty Preferences:</span> Leave blank
            to auto-fill with lowest priority (one lower than your highest
            number)
          </li>
          <li>
            <span className="font-medium">Groups:</span> Each group gets at
            least one room. All participants in a room share the same group. Use
            commas to separate multiple groups (e.g., "11am,2pm"). Leave empty
            to allow assignment to any room. Useful for matching debate times
            with availabilties
          </li>
        </ul>
      </div>
    </div>
  );
}
