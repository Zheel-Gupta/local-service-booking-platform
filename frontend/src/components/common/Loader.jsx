/**
 * Loader — centered animated spinner
 * Usage: <Loader /> or <Loader size="lg" />
 */
function Loader({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-2',
    lg: 'w-14 h-14 border-[3px]',
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className={`${sizeClasses[size]} rounded-full border-slate-600 border-t-indigo-500 animate-spin`}
      />
    </div>
  );
}

export default Loader;
