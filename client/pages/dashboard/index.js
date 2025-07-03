// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CreateProject from './CreateProject';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (projectId) => {
    setShowCreateModal(false);
    router.push(`/projects/${projectId}`);
  };

  const goToProject = (id) => router.push(`/projects/${id}`);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Create Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found. Start by creating one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => goToProject(project._id)}
              className="p-4 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
            >
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
              <span className="text-xs mt-2 inline-block bg-gray-200 px-2 py-1 rounded">
                {project.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProject 
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}