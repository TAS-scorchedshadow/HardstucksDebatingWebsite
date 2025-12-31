/**
 * CSV Parser utility for debate participant data
 */

import { parse } from "csv-parse/browser/esm/sync";
import { parseRows, type DebateRequest } from "./parser";

/**
 * Parse CSV file content into JSON format for backend
 *
 * Expected CSV format:
 * - First row: Headers (Name, role1, role2, ..., Group [optional])
 * - Subsequent rows: participant data
 * - Handles quoted fields with commas properly
 *
 * @param csvContent - Raw CSV file content as string
 * @returns Parsed debate request object
 */
export function parseCSV(csvContent: string): DebateRequest {
  // Use csv-parse to handle quoted fields, commas, and escape sequences
  const rows = parse(csvContent, {
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
  }) as string[][];

  return parseRows(rows);
}

/**
 * Read a File object and return its content as a string
 *
 * @param file - File object to read
 * @returns Promise resolving to file content as string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse a CSV file and return the debate request object
 *
 * @param file - CSV file to parse
 * @returns Promise resolving to parsed debate request
 */
export async function parseCSVFile(file: File): Promise<DebateRequest> {
  if (!file.name.endsWith(".csv")) {
    throw new Error("File must be a CSV file");
  }

  const content = await readFileAsText(file);
  return parseCSV(content);
}

/**
 * Convert debate results to CSV format
 *
 * @param rooms - Room assignments from the backend
 * @param totalPreference - Total preference score
 * @param averagePreference - Average preference score
 * @returns CSV content as string
 */
export function convertResultsToCSV(
  rooms: Array<{
    name: string;
    assignments: Array<{
      name: string;
      role: string;
      preference: number;
      group: string;
    }>;
  }>
): string {
  const lines: string[] = [];

  // Add header
  lines.push("Name,Role,Preference,Group");

  // Add room assignments
  for (const room of rooms) {
    lines.push(room.name);
    for (const assignment of room.assignments) {
      const row = [
        assignment.name,
        assignment.role,
        assignment.preference.toString(),
        assignment.group || "",
      ];
      lines.push(row.join(","));
    }
    lines.push(""); // Empty line between rooms
  }

  return lines.join("\n");
}

/**
 * Download a string as a CSV file
 *
 * @param content - CSV content as string
 * @param filename - Name of the file to download
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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
