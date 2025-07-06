// pages/tasks/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiLoader, 
  FiAlertCircle, 
  FiChevronRight, 
  FiPlus,
  FiCalendar,
  FiFlag,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyTasksPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/tasks/my');
        setTasks(res.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError(err.response?.data?.message || 'Failed to fetch tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTasks();
  }, [user, retryCount]);

  const filteredTasks = tasks
    .filter(task => {
      // Search filter
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project?.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      if (filter === 'completed') return task.status === 'completed' && matchesSearch;
      if (filter === 'pending') return task.status !== 'completed' && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-gray-400';
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FiLoader className="text-4xl text-indigo-600" />
        </motion.div>
        <p className="text-gray-500">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-rose-100 p-4 rounded-full mb-4">
          <FiAlertCircle className="text-rose-600 text-3xl" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/tasks/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FiPlus /> Create Task
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
              {['all', 'pending', 'completed'].map((f) => (
                <motion.button
                  key={f}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center capitalize">
                    {f === 'completed' && <FiCheckCircle className="mr-1.5" size={14} />}
                    {f === 'pending' && <FiClock className="mr-1.5" size={14} />}
                    {f === 'all' && <FiFilter className="mr-1.5" size={14} />}
                    {f}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <FiCheckCircle className="text-indigo-600 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? 'No tasks match your search' : 'No tasks found'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery
                ? `Try a different search term`
                : filter === 'completed'
                  ? "You haven't completed any tasks yet"
                  : filter === 'pending'
                    ? "You're all caught up!"
                    : "You don't have any tasks yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/tasks/create')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                const status = isOverdue ? 'overdue' : task.status;
                
                return (
                  <motion.li
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -2 }}
                    className="bg-white shadow rounded-xl p-5 flex justify-between items-center hover:shadow-md cursor-pointer border border-gray-100"
                    onClick={() => router.push(`/task/${task._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {task.title}
                        </h3>
                        {task.priority && (
                          <FiFlag className={`${getPriorityColor(task.priority)}`} title={`${task.priority} priority`} />
                        )}
                      </div>
                      
                      {task.project?.title && (
                        <p className="text-sm text-gray-500 mb-2">
                          Project: {task.project.title}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)} font-medium`}>
                          {status}
                        </span>
                        
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <FiCalendar className="mr-1.5 text-gray-400" size={12} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400 text-xl flex-shrink-0" />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}