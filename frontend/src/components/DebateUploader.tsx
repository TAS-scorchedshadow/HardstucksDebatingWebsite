import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { parseCSVFile, type DebateRequest } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import DebateResults from "./DebateResults";
import FormatExamples from "./FormatExamples";

interface DebateResponse {
  rooms: Array<{
    name: string;
    assignments: Array<{
      name: string;
      role: string;
      preference: number;
      group: string;
    }>;
  }>;
  total_preference: number;
  average_preference: number;
}

type DebateFormat = "bp" | "traditional";

async function submitDebateRequest(
  format: DebateFormat,
  debateRequest: DebateRequest
): Promise<DebateResponse> {
  const endpoint = format === "bp" ? "/bp" : "/traditional";
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(debateRequest),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to process debate assignment");
  }

  return response.json();
}

export default function DebateUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<DebateFormat | null>(null);
  const [detectedPreferencesLength, setDetectedPreferencesLength] = useState<
    number | null
  >(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Please select a file");
      }
      if (!format) {
        throw new Error("Please select a valid debate format");
      }

      // Determine file type and parse accordingly
      const isExcel = selectedFile.name.match(/\.(xlsx|xls|xlsm|xlsb)$/i);
      const debateRequest = isExcel
        ? await parseExcelFile(selectedFile)
        : await parseCSVFile(selectedFile);

      return submitDebateRequest(format, debateRequest);
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileError(null);
      mutation.reset();

      // Auto-detect format based on preferences length
      try {
        // Determine file type and parse accordingly
        const isExcel = file.name.match(/\.(xlsx|xls|xlsm|xlsb)$/i);
        const debateRequest = isExcel
          ? await parseExcelFile(file)
          : await parseCSVFile(file);

        if (debateRequest.participants.length > 0) {
          const preferencesLength =
            debateRequest.participants[0].preferences.length;
          setDetectedPreferencesLength(preferencesLength);

          if (preferencesLength === 8) {
            setFormat("bp");
          } else if (preferencesLength === 6) {
            setFormat("traditional");
          } else {
            setFormat(null);
            setFileError(
              `Invalid preference count: ${preferencesLength}. Expected 6 (Traditional) or 8 (British Parliamentary).`
            );
          }
        }
      } catch (error) {
        setDetectedPreferencesLength(null);
        setFormat(null);
        setFileError(
          error instanceof Error ? error.message : "Error parsing file"
        );
      }
    }
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(event.target.value as DebateFormat);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Debate Room Assignment
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Upload CSV or Excel File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.xlsm,.xlsb"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {fileError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{fileError}</p>
          </div>
        )}

        {detectedPreferencesLength !== null && !fileError && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Debate Format{" "}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (detected: {detectedPreferencesLength} preferences)
              </span>
            </label>
            <select
              value={format || ""}
              onChange={handleFormatChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={fileError !== null}
            >
              <option value="bp" disabled={detectedPreferencesLength !== 8}>
                British Parliamentary (8 roles)
              </option>
              <option
                value="traditional"
                disabled={detectedPreferencesLength !== 6}
              >
                Traditional (6 roles)
              </option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={
            !selectedFile || !format || mutation.isPending || fileError !== null
          }
          className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {mutation.isPending ? "Processing..." : "Generate Room Assignments"}
        </button>
      </form>

      {mutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-4">
          <p className="font-semibold">Error:</p>
          <p>{mutation.error.message}</p>
        </div>
      )}

      {mutation.isSuccess && mutation.data && format && (
        <DebateResults data={mutation.data} format={format} />
      )}

      <div className="mt-8 space-y-6">
        <FormatExamples />
      </div>
    </div>
  );
}
