import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiLoader,
  FiUser,
  FiCalendar,
  FiMessageCircle,
  FiSend,
  FiCheckCircle,
  FiChevronLeft,
  FiFlag,
  FiAlertCircle,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiTag
} from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';

const TaskDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editValues, setEditValues] = useState({ 
    title: '', 
    description: '', 
    assignedTo: '',
    dueDate: '',
    priority: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/tasks/task/${id}`);
      setTask(res.data);
      setEditValues({
        title: res.data.title,
        description: res.data.description,
        assignedTo: res.data.assignedTo?._id || '',
        dueDate: res.data.dueDate || '',
        priority: res.data.priority || '',
        tags: res.data.tags || []
      });
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tasks/task/${id}/comment`, { text: comment });
      setTask((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
      setComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async () => {
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/task/${id}`, { status: 'completed' });
      setTask((prev) => ({ ...prev, status: res.data.status }));
    } catch (err) {
      console.error('Failed to mark as completed:', err);
      setError('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditTask = async () => {
    try {
      const res = await api.put(`/tasks/task/${id}`, editValues);
      setTask((prev) => ({ ...prev, ...res.data }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete(`/tasks/task/${id}`);
      router.push('/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editValues.tags.includes(newTag.trim())) {
      setEditValues({
        ...editValues,
        tags: [...editValues.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditValues({
      ...editValues,
      tags: editValues.tags.filter(tag => tag !== tagToRemove)
    });
  };

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <FiLoader className="text-4xl text-indigo-600" />
        </motion.div>
        <p className="text-gray-500">Loading task details...</p>
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
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiChevronLeft /> Go Back
        </button>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const status = isOverdue ? 'overdue' : task.status;
  const isAssignedUser = user?.id === task.assignedTo?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiChevronLeft /> Back
          </button>
          {(isAssignedUser || isAdmin) && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                <FiEdit2 /> Edit Task
              </button>
              {isAdmin && (
                <button
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded text-sm"
                >
                  <FiTrash2 /> Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
        
        {/* Status and Priority */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
          {task.priority && (
            <div className="flex items-center gap-1 text-sm">
              <FiFlag className={`${getPriorityColor(task.priority)}`} />
              <span className="capitalize text-gray-600">{task.priority} priority</span>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditing} onClose={() => setIsEditing(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
              <Dialog.Title className="text-lg font-bold mb-4">Edit Task</Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editValues.title}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    placeholder="Task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editValues.dueDate ? format(new Date(editValues.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editValues.priority}
                    onChange={(e) => setEditValues({ ...editValues, priority: e.target.value })}
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editValues.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditTask}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleting} onClose={() => setIsDeleting(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
              <Dialog.Title className="text-lg font-bold mb-2">Delete Task</Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </Dialog.Description>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Task Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Description */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {task.description || 'No description provided'}
              </p>

              {/* Tags */}
              {task.tags?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                        <FiTag className="mr-1 text-gray-500" size={14} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="md:w-64 flex-shrink-0">
              <div className="space-y-4">
                {/* Assigned To */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {task.assignedTo?.name || 'Unassigned'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.assignedTo?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Dates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FiCalendar className="text-gray-400" />
                      <span>Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    {task.startDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="text-gray-400" />
                        <span>Start: {format(new Date(task.startDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-rose-600' : 'text-gray-600'}`}>
                        <FiClock className={isOverdue ? 'text-rose-600' : 'text-gray-400'} />
                        <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Status and Priority */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  {task.priority && (
                    <div className="flex items-center gap-1 text-sm">
                      <FiFlag className={`${getPriorityColor(task.priority)}`} />
                      <span className="capitalize text-gray-600">{task.priority} priority</span>
                    </div>
                  )}
                </div>


                {/* Actions */}
                {isAssignedUser && task.status !== 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMarkCompleted}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70"
                  >
                    <FiCheckCircle />
                    {updating ? 'Marking...' : 'Mark as Completed'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <FiMessageCircle className="text-indigo-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Discussion</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {task.comments?.length || 0}
            </span>
          </div>

          {task.comments?.length > 0 ? (
            <ul className="space-y-4 mb-6">
              <AnimatePresence>
                {task.comments.map((comment, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <FiUser />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-indigo-600">
                            {comment.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
              <FiMessageCircle className="mx-auto text-gray-400 text-3xl mb-2" />
              <h3 className="text-gray-500">No comments yet</h3>
              <p className="text-gray-400 text-sm mt-1">Be the first to comment</p>
            </div>
          )}

          {/* Add comment form */}
          <form onSubmit={handleCommentSubmit} className="mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FiUser />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write a comment... (use @name to mention someone)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Press Enter to submit, Shift+Enter for new line
                  </p>
                  <motion.button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend /> {submitting ? 'Posting...' : 'Post'}
                  </motion.button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;