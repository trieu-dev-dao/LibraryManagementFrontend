function StatisticsCard({
  metricKey,
  title,
  value,
  description,
  icon,
  color = "blue",
  error = false,
}) {
  const colorStyles = {
    blue: "bg-sage-100 text-navy-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-sage-100 text-sage-800",
    orange: "bg-terracotta-100 text-terracotta-700",
  };

  return (
    <div data-metric-key={metricKey} data-state={error ? 'error' : value === 0 ? 'zero' : typeof value === 'number' ? 'ready' : 'unavailable'} className={`surface p-5 ${error ? 'border-amber-300' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <h3 className={`mt-2 text-2xl font-bold ${typeof value === 'number' ? 'text-ink' : 'text-amber-900'}`}>
            {value}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            colorStyles[color] || colorStyles.blue
          }`}
        >
          {icon}
        </div>
      </div>

      {description && (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default StatisticsCard;
