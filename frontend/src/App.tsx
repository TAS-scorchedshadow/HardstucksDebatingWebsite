import "./App.css";
import DebateUploader from "./components/DebateUploader";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div>
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      <DebateUploader />
    </div>
  );
}

export default App;
