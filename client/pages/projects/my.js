// pages/projects/my.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/router';
import { 
  FiLoader, 
  FiAlertCircle, 
  FiPlus, 
  FiTag, 
  FiCalendar,
  FiUser,
  FiArchive,
  FiUsers,
  FiGrid,
  FiAward,
  FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    // Filter by category
    let matchesFilter = false;
    if (filter === 'owned') matchesFilter = user.id === project.createdBy?._id;
    else if (filter === 'member') matchesFilter = user.id !== project.createdBy?._id;
    else if (filter === 'archived') matchesFilter = project.status === 'archived';
    else matchesFilter = true; // 'all'
    
    // Filter by search query
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesFilter && matchesSearch;
  });

  const getFilterIcon = (filterType) => {
    switch(filterType) {
      case 'owned': return <FiUser className="mr-1" />;
      case 'member': return <FiUsers className="mr-1" />;
      case 'archived': return <FiArchive className="mr-1" />;
      default: return <FiGrid className="mr-1" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'on hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FiLoader className="animate-spin text-3xl text-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-600">
      <FiAlertCircle className="text-2xl mr-2" />
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage and track all your projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/projects/create')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <FiPlus className="text-lg" /> Create Project
        </motion.button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'owned', 'member', 'archived'].map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(f)}
              className={`flex items-center px-3 py-1.5 rounded-full border text-sm transition-colors ${
                filter === f 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {getFilterIcon(f)}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <FiAward className="text-indigo-600 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
          <p className="text-gray-500 max-w-md">
            {searchQuery 
              ? `No projects match your search for "${searchQuery}"`
              : filter === 'all'
                ? "You don't have any projects yet. Create your first project!"
                : `You don't have any ${filter} projects.`}
          </p>
          {(!searchQuery && filter === 'all') && (
            <button
              onClick={() => router.push('/projects/create')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -5 }}
                className="group relative p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer overflow-hidden"
                onClick={() => router.push(`/projects/${project._id}`)}
              >
                {project.status === 'completed' && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl-lg">
                    Completed
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        <FiTag className="text-xs opacity-70" /> {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-gray-400" /> 
                        <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {project.targetDate && (
                      <div className="flex items-center gap-1">
                        <FiClock className="text-gray-400" />
                        <span>Due: {new Date(project.targetDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {project.createdBy && (
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <span className="truncate">
                        Created by: {project.createdBy.name || project.createdBy.email}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}