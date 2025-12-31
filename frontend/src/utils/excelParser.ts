/**
 * Excel Parser utility for debate participant data
 */

import * as XLSX from 'xlsx';
import { parseRows, type DebateRequest } from './csvParser';

/**
 * Parse Excel file content into JSON format for backend
 *
 * Expected Excel format:
 * - First row: Headers (Name, role1, role2, ..., Group [optional])
 * - Subsequent rows: participant data
 *
 * @param workbook - XLSX Workbook object
 * @returns Parsed debate request object
 */
export function parseExcel(workbook: XLSX.WorkBook): DebateRequest {
  // Get the first worksheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel file must have at least one worksheet');
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to array of arrays
  const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Convert to string arrays for parseRows
  const rows = data.map(row =>
    (row as unknown[]).map(v => String(v ?? ''))
  );

  return parseRows(rows);
}

/**
 * Read a File object as ArrayBuffer
 *
 * @param file - File object to read
 * @returns Promise resolving to ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (content instanceof ArrayBuffer) {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse an Excel file and return the debate request object
 *
 * @param file - Excel file to parse (.xlsx, .xls)
 * @returns Promise resolving to parsed debate request
 */
export async function parseExcelFile(file: File): Promise<DebateRequest> {
  const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

  if (!hasValidExtension) {
    throw new Error('File must be an Excel file (.xlsx, .xls, .xlsm, or .xlsb)');
  }

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  return parseExcel(workbook);
}

/**
 * Convert debate results to Excel format and download
 *
 * @param rooms - Room assignments from the backend
 * @param filename - Name of the file to download
 */
export function downloadExcel(
  rooms: Array<{
    name: string;
    assignments: Array<{
      name: string;
      role: string;
      preference: number;
      group: string;
    }>;
  }>,
  filename: string
): void {
  const data: unknown[][] = [];

  // Add header
  data.push(['Name', 'Role', 'Preference', 'Group']);

  // Add room assignments
  for (const room of rooms) {
    // Add room name as a merged row
    data.push([room.name, '', '', '']);

    for (const assignment of room.assignments) {
      data.push([
        assignment.name,
        assignment.role,
        assignment.preference,
        assignment.group || '',
      ]);
    }

    // Empty row between rooms
    data.push(['', '', '', '']);
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Room Assignments');

  // Download file
  XLSX.writeFile(workbook, filename);
}
