/**
 * CSV Parser utility for debate participant data
 */

export interface Participant {
  name: string;
  preferences: number[];
  group?: string[];
}

export interface DebateRequest {
  participants: Participant[];
}

/**
 * Parse rows of data into DebateRequest format
 *
 * @param rows - Array of row data (first row is headers, rest are data)
 * @returns Parsed debate request object
 */
export function parseRows(rows: string[][]): DebateRequest {
  if (rows.length < 2) {
    throw new Error("Data must have at least a header row and one data row");
  }

  // Parse header to check for "Group" column
  const headers = rows[0].map((h) => h.trim());
  const hasGroupColumn = headers[headers.length - 1].toLowerCase() === "group";

  const participants: Participant[] = [];

  // Parse data rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].map((v) => v.trim());

    // Skip empty rows
    if (values.length === 0 || !values[0]) continue;

    if (values.length < 2) {
      throw new Error(
        `Invalid row at line ${
          i + 1
        }: must have at least name and one preference\nLine content: "${values.join(", ")}"`
      );
    }

    const name = values[0];
    let preferences: number[];
    let group: string[] = [];

    if (hasGroupColumn) {
      // Last column is group, middle columns are preferences
      try {
        const prefStrings = values.slice(1, -1);
        const tempPreferences: (number | null)[] = prefStrings.map((v, idx) => {
          if (v === "") {
            return null; // Missing preference - will fill in later
          }
          const num = parseInt(v, 10);
          if (isNaN(num)) {
            throw new Error(
              `Invalid preference value "${v}" at column ${idx + 2}`
            );
          }
          return num;
        });

        // Fill in missing preferences with max + 1
        const validPrefs = tempPreferences.filter((p): p is number => p !== null);
        const fillValue = validPrefs.length > 0 ? Math.max(...validPrefs) + 1 : 1;
        preferences = tempPreferences.map((p) => (p !== null ? p : fillValue));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Error at line ${i + 1}: ${message}\nLine content: "${values.join(", ")}"`
        );
      }

      const groupValue = values[values.length - 1];
      if (groupValue && groupValue.length > 0) {
        group = groupValue
          .split(";")
          .map((g) => g.trim())
          .filter((g) => g.length > 0);
      }
    } else {
      // All columns after name are preferences
      try {
        const prefStrings = values.slice(1);
        const tempPreferences: (number | null)[] = prefStrings.map((v, idx) => {
          if (v === "") {
            return null; // Missing preference - will fill in later
          }
          const num = parseInt(v, 10);
          if (isNaN(num)) {
            throw new Error(
              `Invalid preference value "${v}" at column ${idx + 2}`
            );
          }
          return num;
        });

        // Fill in missing preferences with max + 1
        const validPrefs = tempPreferences.filter((p): p is number => p !== null);
        const fillValue = validPrefs.length > 0 ? Math.max(...validPrefs) + 1 : 1;
        preferences = tempPreferences.map((p) => (p !== null ? p : fillValue));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Error at line ${i + 1}: ${message}\nLine content: "${values.join(", ")}"`
        );
      }
    }

    participants.push({
      name,
      preferences,
      group: group.length > 0 ? group : undefined,
    });
  }

  if (participants.length === 0) {
    throw new Error("No valid participants found in data");
  }

  return { participants };
}

/**
 * Parse CSV file content into JSON format for backend
 *
 * Expected CSV format:
 * - First row: Headers (Name, role1, role2, ..., Group [optional])
 * - Subsequent rows: participant data
 *
 * @param csvContent - Raw CSV file content as string
 * @returns Parsed debate request object
 */
export function parseCSV(csvContent: string): DebateRequest {
  const lines = csvContent.trim().split("\n");
  const rows = lines.map((line) => line.split(","));
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
