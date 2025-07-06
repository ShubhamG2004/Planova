const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;