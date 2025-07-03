import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'active',
    tags: '',
    startDate: '',
    targetDate: ''
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data.createdBy._id !== user.id) {
          setError('You are not authorized to edit this project');
          return;
        }

        setProject(res.data);
        setForm({
          title: res.data.title,
          description: res.data.description || '',
          status: res.data.status || 'active',
          tags: res.data.tags?.join(', ') || '',
          startDate: res.data.startDate ? res.data.startDate.slice(0, 10) : '',
          targetDate: res.data.targetDate ? res.data.targetDate.slice(0, 10) : ''
        });
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim())
      });
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <button
        onClick={() => router.push(`/projects/${id}`)}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
      >
        <FiArrowLeft />
        <span>Back to project</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Date</label>
            <input
              type="date"
              name="targetDate"
              value={form.targetDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
