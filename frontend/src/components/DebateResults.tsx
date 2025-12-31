import { convertResultsToCSV, downloadCSV } from "../utils/csvParser";
import { downloadExcel } from "../utils/excelParser";
import { RiFileExcel2Fill } from "react-icons/ri";
import DownloadCSVButton from "./DownloadCSVButton";

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
    const csvContent = convertResultsToCSV(data.rooms);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `debate_assignments_${format}_${timestamp}.csv`;

    downloadCSV(csvContent, filename);
  };

  const handleDownloadExcel = () => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `debate_assignments_${format}_${timestamp}.xlsx`;

    downloadExcel(data.rooms, filename);
  };

  // Calculate expected room size based on format
  const expectedRoomSize = format === "bp" ? 8 : 6;

  // Calculate total people and find incomplete rooms
  const totalPeople = data.rooms.reduce(
    (sum, room) => sum + room.assignments.length,
    0
  );
  const incompleteRooms = data.rooms.filter(
    (room) => room.assignments.length !== expectedRoomSize
  );

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Results
        </h2>
        <div className="flex gap-2">
          <DownloadCSVButton onClick={handleDownloadCSV}>
            Download CSV
          </DownloadCSVButton>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-700 text-white py-2 px-4 rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors"
          >
            <RiFileExcel2Fill className="text-lg" />
            Download Excel
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
        <div className="flex w-full ">
          <p className="text-gray-900 dark:text-gray-100 w-1/3 ">
            <span className="font-semibold">Total Rooms:</span>{" "}
            {data.rooms.length}
          </p>
          <p className="text-gray-900 dark:text-gray-100 w-1/3">
            <span className="font-semibold">Total People:</span> {totalPeople}
          </p>
          <p className="text-gray-900 dark:text-gray-100 w-1/3">
            <span className="font-semibold">Average Preference:</span>{" "}
            {data.average_preference.toFixed(2)}
          </p>
        </div>

        {incompleteRooms.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
              Irregular Rooms (expecting {expectedRoomSize} people):
            </p>
            <ul className="list-disc list-inside space-y-1">
              {incompleteRooms.map((room, idx) => (
                <li key={idx} className="text-gray-900 dark:text-gray-100">
                  {room.name}: {room.assignments.length} people
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
        Room Assignments
      </h3>
      <div className="space-y-4">
        {data.rooms.map((room, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4"
          >
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {room.name}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">
                      Name
                    </th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">
                      Role
                    </th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">
                      Preference
                    </th>
                    <th className="text-left py-2 px-3 text-gray-900 dark:text-gray-100">
                      Group
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {room.assignments.map((assignment, assignmentIdx) => (
                    <tr
                      key={assignmentIdx}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                        {assignment.name}
                      </td>
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                        {assignment.role}
                      </td>
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                        {assignment.preference}
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                        {assignment.group || "-"}
                      </td>
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
