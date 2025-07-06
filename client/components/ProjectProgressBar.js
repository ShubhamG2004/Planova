const ProjectProgressBar = ({ progress, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${colorClasses[color]}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProjectProgressBar;