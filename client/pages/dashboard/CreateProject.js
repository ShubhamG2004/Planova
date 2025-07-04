import { useState } from 'react';
import api from '@/lib/api';

export default function CreateProject({ onClose, onCreateSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [milestones, setMilestones] = useState([{ milestone: '', dueDate: '' }]);
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createProject = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/projects', {
        title,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        tags,
        roadmap: milestones
          .filter((m) => m.milestone && m.dueDate)
          .map((m) => ({
            milestone: m.milestone.trim(),
            dueDate: new Date(m.dueDate),
          })),
        members: memberEmails,
      });

      resetForm();
      onCreateSuccess(res.data._id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('active');
    setTags([]);
    setTagInput('');
    setMilestones([{ milestone: '', dueDate: '' }]);
    setStartDate('');
    setTargetDate('');
    setMemberEmails([]);
    setMemberEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={createProject} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium">Project Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Start and Target Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  if (!tags.includes(tagInput.trim()))
                    setTags([...tags, tagInput.trim()]);
                  setTagInput('');
                }
              }}
              className="w-full px-3 py-2 border rounded-lg mt-1"
              placeholder="Press Enter to add tag"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="ml-1 text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium mb-1">Roadmap / Milestones</label>
            {milestones.map((m, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Milestone"
                  value={m.milestone}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[index].milestone = e.target.value;
                    setMilestones(updated);
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[index].dueDate = e.target.value;
                    setMilestones(updated);
                  }}
                  className="w-36 px-3 py-2 border rounded-lg"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMilestones(milestones.filter((_, i) => i !== index))
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
                setMilestones([...milestones, { milestone: '', dueDate: '' }])
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
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter email"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  if (memberEmail.trim()) {
                    setMemberEmails([...memberEmails, memberEmail.trim()]);
                    setMemberEmail('');
                  }
                }}
                className="px-3 py-2 bg-gray-200 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {memberEmails.map((email, i) => (
                <span
                  key={i}
                  className="bg-gray-200 px-2 py-1 rounded text-sm"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() =>
                      setMemberEmails(memberEmails.filter((e) => e !== email))
                    }
                    className="ml-1 text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white transition ${
                loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
