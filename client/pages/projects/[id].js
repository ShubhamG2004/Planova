// pages/projects/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { FiLoader, FiAlertCircle, FiTag, FiUsers, FiUser, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error('Failed to load project:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading project details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-6 bg-red-50 rounded-xl text-center">
        <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error loading project</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FiArrowLeft />
          <span>Go back</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to projects</span>
          </button>
        </div>

        {/* Project header section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`${statusColors[project.status] || 'bg-gray-100'} px-3 py-1 rounded-full text-sm font-medium`}>
                {project.status}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <FiCalendar className="text-gray-400" />
                <span>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Tags section */}
          {project.tags?.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiTag />
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
        </div>

        {/* Project details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Created by card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FiUser className="text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Created By</h2>
            </div>
            <div className="pl-11">
              <p className="font-medium text-gray-800">{project.createdBy?.name}</p>
              <p className="text-sm text-gray-500">{project.createdBy?.email}</p>
            </div>
          </div>

          {/* Members card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <FiUsers className="text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
            </div>
            {project.members?.length > 0 ? (
              <ul className="pl-11 space-y-3">
                {project.members.map((member) => (
                  <li key={member._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
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
              <div className="pl-11">
                <p className="text-gray-500">No members added to this project</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional project details can be added here */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="text-gray-800">
                {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Target Date</h3>
              <p className="text-gray-800">
                {project.targetDate ? format(new Date(project.targetDate), 'MMM d, yyyy') : 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-gray-800">
                {format(new Date(project.updatedAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}