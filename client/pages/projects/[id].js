import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiLoader,
  FiAlertCircle,
  FiTag,
  FiUsers,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiClock,
  FiCheckCircle,
  FiFolder
} from 'react-icons/fi';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Project state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Task state
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState('');

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    assignedTo: '',
    status: 'todo',
  });
  const [taskFormError, setTaskFormError] = useState('');

  // Status colors
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  // Task status configuration
  const taskStatus = {
    todo: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FiClock className="text-gray-500" />,
      label: 'To Do'
    },
    'in-progress': { 
      color: 'bg-blue-100 text-blue-800', 
      icon: <FiLoader className="text-blue-500 animate-spin" />,
      label: 'In Progress'
    },
    done: { 
      color: 'bg-green-100 text-green-800', 
      icon: <FiCheckCircle className="text-green-500" />,
      label: 'Done'
    }
  };

  // Fetch project and tasks data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/${id}`)
        ]);
        
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.message || 'Failed to load project');
        setTaskError('Failed to load tasks');
      } finally {
        setLoading(false);
        setTaskLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Create new task
  const handleCreateTask = async () => {
    try {
      setTaskFormError('');
      const response = await api.post(`/tasks/${project._id}`, newTask);
      setShowTaskModal(false);
      setTasks([...tasks, response.data]);
      setNewTask({ 
        title: '', 
        description: '', 
        startDate: '', 
        dueDate: '', 
        assignedTo: '', 
        status: 'todo' 
      });
    } catch (err) {
      setTaskFormError(err.response?.data?.message || 'Failed to create task');
    }
  };

  // Delete project
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${project._id}`);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to delete project');
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Invite team member
  const handleInvite = async () => {
    try {
      setInviteError('');
      setInviteSuccess('');
      await api.post(`/invites/${project._id}`, { email: inviteEmail });
      setInviteSuccess('Invitation sent successfully');
      setInviteEmail('');
      setTimeout(() => setShowInviteModal(false), 1500);
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-4xl text-indigo-600 mx-auto mb-4"
        >
          <FiLoader />
        </motion.div>
        <p className="text-gray-600 text-lg">Loading project details...</p>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-6 bg-white rounded-xl shadow-sm text-center border border-gray-200">
        <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error loading project</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <FiArrowLeft />
          <span>Go back</span>
        </button>
      </div>
    </div>
  );

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header with back button and action buttons */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <FiArrowLeft />
            <span>Back to projects</span>
          </button>

          {user && project.createdBy && user.id?.toString() === project.createdBy._id?.toString() && (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/projects/${project._id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 transition-colors shadow-sm"
              >
                <FiEdit2 size={16} />
                <span>Edit Project</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <FiTrash2 size={16} />
                <span>{deleting ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Main project card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600 text-lg">{project.description}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <span className={`${statusColors[project.status] || 'bg-gray-100'} px-3 py-1 rounded-full text-sm font-medium`}>
                {project.status}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar className="text-gray-400" />
                <span>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {project.tags?.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <FiTag className="text-indigo-500" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Team Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Members Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FiUsers className="text-xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
                </div>
                {user.id === project.createdBy._id && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <FiPlus size={14} />
                    <span>Invite</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Project Owner */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FiUser />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{project.createdBy.name}</p>
                    <p className="text-sm text-gray-500">Owner • {project.createdBy.email}</p>
                  </div>
                </div>

                {/* Team Members */}
                {project.members?.length > 0 ? (
                  <ul className="space-y-3">
                    {project.members.map((member) => (
                      <li key={member._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No other members in this project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FiPlus size={14} />
                  <span>New Task</span>
                </button>
              </div>

              {taskLoading ? (
                <div className="flex justify-center py-8">
                  <FiLoader className="animate-spin text-indigo-600 text-xl" />
                </div>
              ) : taskError ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
                  {taskError}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiFolder className="mx-auto text-3xl mb-2 text-gray-400" />
                  <p>No tasks found for this project</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <FiPlus size={14} />
                    <span>Create First Task</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(taskStatus).map(([status, { icon, color, label }]) => (
                    <div key={status} className="space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                        {icon}
                        <h3 className="font-medium text-sm text-gray-700">
                          {label} ({tasks.filter(t => t.status === status).length})
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {tasks
                          .filter((task) => task.status === status)
                          .map((task) => (
                            <motion.li
                              key={task._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                              onClick={() => router.push(`/task/${task._id}`)}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800">{task.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
                                  {label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                  {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span>{task.assignedTo?.name || 'Unassigned'}</span>
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                  <FiCalendar size={14} />
                                  <span>Due: {format(new Date(task.dueDate), 'MMM d')}</span>
                                </div>
                              )}
                            </motion.li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Timeline</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <div className="flex items-center gap-2 text-gray-800">
                    <FiCalendar className="text-indigo-500" />
                    <span>
                      {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not specified'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Target Date</h3>
                  <div className="flex items-center gap-2 text-gray-800">
                    <FiCalendar className="text-indigo-500" />
                    <span>
                      {project.targetDate ? format(new Date(project.targetDate), 'MMM d, yyyy') : 'Not specified'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <div className="flex items-center gap-2 text-gray-800">
                    <FiCalendar className="text-indigo-500" />
                    <span>{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <FiPlus size={16} />
                  <span>Create New Task</span>
                </button>
                <button
                  onClick={() => router.push(`/projects/${project._id}/edit`)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={16} />
                  <span>Edit Project Details</span>
                </button>
                {user.id === project.createdBy._id && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <FiUser size={16} />
                    <span>Invite Team Members</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Invite to Project</h2>
              <p className="text-gray-600 mb-4">Send an invitation to collaborate on this project</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="team@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteSuccess ? <FiCheck /> : <FiUser />}
                  <span>{inviteSuccess ? 'Invite Sent!' : 'Send Invitation'}</span>
                </button>
                
                {inviteError && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded-lg">
                    {inviteError}
                  </div>
                )}
                {inviteSuccess && (
                  <div className="text-green-600 text-sm p-2 bg-green-50 rounded-lg">
                    {inviteSuccess}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl"
            >
              <button 
                onClick={() => setShowTaskModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(taskStatus).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((member) => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                {taskFormError && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded-lg">
                    {taskFormError}
                  </div>
                )}

                <button
                  onClick={handleCreateTask}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus size={16} />
                  <span>Create Task</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}