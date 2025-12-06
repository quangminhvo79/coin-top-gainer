/**
 * Presentational component for Loading Skeleton
 * Displays shimmer effect while data is loading
 */
function LoadingSkeletonPresentation({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="glass rounded-2xl p-6 h-64 shimmer"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export default LoadingSkeletonPresentation;
