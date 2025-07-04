import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'active',
    tags: [],
    tagInput: '',
    roadmap: [{ milestone: '', dueDate: '' }],
    members: [],
    memberInput: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const project = res.data;

        if (project.createdBy._id !== user.id) {
          setError('You are not authorized to edit this project');
          return;
        }

        setForm({
          title: project.title,
          description: project.description || '',
          status: project.status || 'active',
          tags: project.tags || [],
          tagInput: '',
          roadmap: project.roadmap?.length
            ? project.roadmap.map(r => ({
                milestone: r.milestone,
                dueDate: r.dueDate?.slice(0, 10)
              }))
            : [{ milestone: '', dueDate: '' }],
          members: project.members?.map(m => m.email) || [],
          memberInput: ''
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
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        ...form,
        tags: form.tags,
        roadmap: form.roadmap.filter(r => r.milestone && r.dueDate),
        members: form.members
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
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium">Tags</label>
          <input
            type="text"
            name="tagInput"
            value={form.tagInput}
            onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && form.tagInput.trim()) {
                e.preventDefault();
                if (!form.tags.includes(form.tagInput.trim())) {
                  setForm(prev => ({
                    ...prev,
                    tags: [...prev.tags, prev.tagInput.trim()],
                    tagInput: ''
                  }));
                }
              }
            }}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            placeholder="Press Enter to add tag"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {form.tags.map((tag, i) => (
              <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      tags: prev.tags.filter(t => t !== tag)
                    }))
                  }
                  className="ml-1 text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <label className="block text-sm font-medium mb-1">Roadmap / Milestones</label>
          {form.roadmap.map((m, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Milestone"
                value={m.milestone}
                onChange={(e) => {
                  const updated = [...form.roadmap];
                  updated[index].milestone = e.target.value;
                  setForm(prev => ({ ...prev, roadmap: updated }));
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) => {
                  const updated = [...form.roadmap];
                  updated[index].dueDate = e.target.value;
                  setForm(prev => ({ ...prev, roadmap: updated }));
                }}
                className="w-36 px-3 py-2 border rounded-lg"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      roadmap: prev.roadmap.filter((_, i) => i !== index)
                    }))
                  }
                  className="text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm(prev => ({
                ...prev,
                roadmap: [...prev.roadmap, { milestone: '', dueDate: '' }]
              }))
            }
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add Milestone
          </button>
        </div>

        {/* Members */}
        <div>
          <label className="block text-sm font-medium mb-1">Invite Members by Email</label>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={form.memberInput}
              onChange={(e) => setForm(prev => ({ ...prev, memberInput: e.target.value }))}
              placeholder="Enter email"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                if (form.memberInput.trim()) {
                  setForm(prev => ({
                    ...prev,
                    members: [...prev.members, prev.memberInput.trim()],
                    memberInput: ''
                  }));
                }
              }}
              className="px-3 py-2 bg-gray-200 rounded"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.members.map((email, i) => (
              <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">
                {email}
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      members: prev.members.filter((e) => e !== email)
                    }))
                  }
                  className="ml-1 text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
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
