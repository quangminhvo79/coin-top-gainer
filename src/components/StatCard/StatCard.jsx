function StatCard({ title, value, subtitle, icon, delay = '0s', highlight = false }) {
  return (
    <div
      className={`glass-medium rounded-2xl p-6 hover-glow transition-all duration-300 ${
        highlight ? 'ring-2 ring-purple-500/50' : ''
      }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className={`text-3xl md:text-4xl font-bold orbitron ${
            highlight ? 'gradient-text' : 'text-white'
          }`}>
            {value}
          </h3>
        </div>
        <div className="text-4xl opacity-50">
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        {subtitle}
      </p>
      {highlight && (
        <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}

export default StatCard;
