import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { FiPlus, FiX, FiCalendar, FiTag } from 'react-icons/fi';

export default function CreateProject() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    roadmap: [{ milestone: '', dueDate: '' }]
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoadmapChange = (index, field, value) => {
    const updatedRoadmap = [...formData.roadmap];
    updatedRoadmap[index][field] = value;
    setFormData(prev => ({
      ...prev,
      roadmap: updatedRoadmap
    }));
  };

  const addRoadmapItem = () => {
    setFormData(prev => ({
      ...prev,
      roadmap: [...prev.roadmap, { milestone: '', dueDate: '' }]
    }));
  };

  const removeRoadmapItem = (index) => {
    const updatedRoadmap = formData.roadmap.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      roadmap: updatedRoadmap
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/projects', formData);
      router.push(`/projects/${data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Project</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 mb-6 rounded-md text-sm flex items-center">
          <FiX className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="My Awesome Project"
            maxLength="100"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your project..."
            maxLength="500"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add a tag (e.g. 'web', 'mobile')"
              maxLength="20"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition"
            >
              <FiPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Roadmap</label>
          {formData.roadmap.map((item, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Milestone {index + 1}</h3>
                {formData.roadmap.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoadmapItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={item.milestone}
                  onChange={(e) => handleRoadmapChange(index, 'milestone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="What needs to be achieved?"
                  maxLength="200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Target Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => handleRoadmapChange(index, 'dueDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <FiCalendar className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRoadmapItem}
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm mt-2"
          >
            <FiPlus className="mr-1" /> Add Milestone
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FiPlus className="mr-2" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}