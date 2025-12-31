import { FaFileCsv } from "react-icons/fa";

interface DownloadCSVButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "gray" | "primary";
}

export default function DownloadCSVButton({
  onClick,
  children,
  size = "md",
  variant = "gray",
}: DownloadCSVButtonProps) {
  const sizeClasses = {
    sm: "text-sm py-1 px-3",
    md: "py-2 px-4",
  };

  const variantClasses = {
    gray: "bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600",
    primary:
      "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${variantClasses[variant]} text-white rounded-md transition-colors ${sizeClasses[size]} cursor-pointer`}
    >
      <FaFileCsv className="text-lg" />
      {children}
    </button>
  );
}
