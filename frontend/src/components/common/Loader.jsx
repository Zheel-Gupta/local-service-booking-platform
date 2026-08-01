/**
 * Loader — centered animated spinner matching the indigo/purple design system
 * Usage: <Loader /> or <Loader size="lg" />
 */
function Loader({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div
        className={`${sizeClasses[size]} rounded-full border-indigo-100 border-t-indigo-600 animate-spin`}
      />
      {size === 'lg' && (
        <p className="text-xs font-semibold text-gray-400 animate-pulse">Loading...</p>
      )}
    </div>
  );
}

export default Loader;
