import { convertResultsToCSV, downloadCSV } from "../utils/csvParser";

interface Assignment {
  name: string;
  role: string;
  preference: number;
  group: string;
}

interface Room {
  name: string;
  assignments: Assignment[];
}

interface DebateResponse {
  rooms: Room[];
  total_preference: number;
  average_preference: number;
}

interface DebateResultsProps {
  data: DebateResponse;
  format: "bp" | "traditional";
}

export default function DebateResults({ data, format }: DebateResultsProps) {
  const handleDownloadCSV = () => {
    const csvContent = convertResultsToCSV(
      data.rooms,
      data.total_preference,
      data.average_preference
    );

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `debate_assignments_${format}_${timestamp}.csv`;

    downloadCSV(csvContent, filename);
  };

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Results</h2>
        <button
          onClick={handleDownloadCSV}
          className="bg-green-600 dark:bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          Download CSV
        </button>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <p className="text-lg text-gray-900 dark:text-gray-100">
          <span className="font-semibold">Total Preference:</span>{" "}
          {data.total_preference}
        </p>
        <p className="text-lg text-gray-900 dark:text-gray-100">
          <span className="font-semibold">Average Preference:</span>{" "}
          {data.average_preference}
        </p>
      </div>

      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Room Assignments</h3>
      <div className="space-y-4">
        {data.rooms.map((room, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4"
          >
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{room.name}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">Name</th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">Role</th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">Preference</th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {room.assignments.map((assignment, assignmentIdx) => (
                    <tr
                      key={assignmentIdx}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{assignment.name}</td>
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{assignment.role}</td>
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{assignment.preference}</td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{assignment.group || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
