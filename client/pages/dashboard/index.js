// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CreateProject from './CreateProject';
import { FiPlus, FiLoader, FiAlertCircle, FiFolder, FiChevronRight } from 'react-icons/fi';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  



  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (projectId) => {
    setShowCreateModal(false);
    router.push(`/projects/${projectId}`);
  };

  const goToProject = (id) => router.push(`/projects/${id}`);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <h1 className="text-3xl text-gray-900">{user?.email}</h1>
            <h1 className="text-3xl text-gray-900">{user?.id}</h1>
            <p className="text-gray-500 mt-1 mb-3">Manage your projects and tasks</p>
  

            <button
              onClick={() => logout()}
              className="text-sm text-gray-600 hover:text-red-600 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            <FiPlus className="text-lg" />
            <span>Create Project</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
            <span className="text-sm text-gray-500">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="animate-spin text-3xl text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading your projects...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg">
              <FiAlertCircle className="text-3xl text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={fetchProjects}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Try again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <FiFolder className="text-3xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                Get started by creating your first project to organize your work
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors"
              >
                <FiPlus />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => goToProject(project._id)}
                  className="group relative p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {project.title}
                      </h2>
                      <FiChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-3 py-1 rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateProject 
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}