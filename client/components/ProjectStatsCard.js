import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const ProjectStatsCard = ({ icon, title, value, percentage, trend, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <div className="p-2.5 rounded-lg inline-flex mb-3" style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        
        {percentage !== undefined && (
          <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
              {percentage}%
            </span>
            {trend !== undefined && (
              <span className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectStatsCard;