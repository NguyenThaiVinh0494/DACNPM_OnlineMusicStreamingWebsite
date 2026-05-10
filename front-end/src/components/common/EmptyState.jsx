import { FiMusic, FiSearch, FiFolder } from 'react-icons/fi';

export default function EmptyState({ title, description, type = "default", className = "" }) {
  const getIcon = () => {
    switch (type) {
      case "search":
        return <FiSearch className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 mx-auto" />;
      case "music":
        return <FiMusic className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 mx-auto" />;
      case "folder":
      default:
        return <FiFolder className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 mx-auto" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {getIcon()}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-nct-text-dim max-w-sm mx-auto">{description}</p>}
    </div>
  );
}
