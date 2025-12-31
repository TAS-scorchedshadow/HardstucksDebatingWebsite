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
        }: must have at least name and one preference\nLine content: "${values.join(
          ", "
        )}"`
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
        const validPrefs = tempPreferences.filter(
          (p): p is number => p !== null
        );
        const fillValue =
          validPrefs.length > 0 ? Math.max(...validPrefs) + 1 : 1;
        preferences = tempPreferences.map((p) => (p !== null ? p : fillValue));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Error at line ${i + 1}: ${message}\nLine content: "${values.join(
            ", "
          )}"`
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
        const validPrefs = tempPreferences.filter(
          (p): p is number => p !== null
        );
        const fillValue =
          validPrefs.length > 0 ? Math.max(...validPrefs) + 1 : 1;
        preferences = tempPreferences.map((p) => (p !== null ? p : fillValue));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Error at line ${i + 1}: ${message}\nLine content: "${values.join(
            ", "
          )}"`
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
