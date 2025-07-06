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
  FiCheckCircle
} from 'react-icons/fi';
import { format } from 'date-fns';

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/task/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async () => {
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/task/${id}`, {
        status: 'completed',
      });
      setTask((prev) => ({
        ...prev,
        status: res.data.status,
      }));
    } catch (err) {
      console.error('Failed to mark as completed:', err);
    } finally {
      setUpdating(false);
    }
  };


  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        <p>{error}</p>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
      <p className="text-gray-700 mb-4">{task.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <FiUser />
          <span>
            Assigned to: {task.assignedTo?.name || 'Unassigned'} ({task.assignedTo?.email || 'N/A'})
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FiCalendar />
          <span>Start: {task.startDate ? format(new Date(task.startDate), 'MMM d, yyyy') : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FiCalendar />
          <span>Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>Status:</span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      {/* Show "Mark Completed" if user is the assigned one and task is not completed */}
      {user?.id === task.assignedTo?._id && task.status !== 'completed' && (
        <button
          onClick={handleMarkCompleted}
          disabled={updating}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
        >
          <FiCheckCircle />
          {updating ? 'Marking...' : 'Mark as Completed'}
        </button>
      )}

      {/* Comments Section */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiMessageCircle className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Discussion</h2>
        </div>

        {task.comments?.length > 0 ? (
            <ul className="space-y-4 mb-4">
              {task.comments.map((c, i) => (
                <li key={i} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold text-indigo-600">
                      {c.user?.name || 'Unknown User'}
                    </span>: {c.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.createdAt
                      ? format(new Date(c.createdAt), 'MMM d, yyyy hh:mm a')
                      : 'Time unknown'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mb-4">No comments yet. Start the discussion!</p>
          )}


        {/* Add comment input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-2 border rounded-lg"
            placeholder="Write a comment... (use @name to mention)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}
