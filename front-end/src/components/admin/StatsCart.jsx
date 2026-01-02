import PropTypes from 'prop-types';

export default function StatsCart({ title, value, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className="text-3xl p-3 rounded-full bg-blue-50 text-blue-500">
          {icon}
        </div>
      </div>

      {trend && (
        <div className={`mt-4 flex items-center text-sm ${
          trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
        }`}>
          <span className="font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
}

StatsCart.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  trend: PropTypes.string
};