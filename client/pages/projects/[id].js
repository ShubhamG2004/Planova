// pages/projects/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';

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

  if (loading) return <div className="p-6">Loading project...</div>;
  if (error)
    return (
      <div className="p-6 text-red-600 font-semibold">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600 mt-2">{project.description}</p>

      <div className="mt-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
          Status: {project.status}
        </span>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Tags:</h2>
        {project.tags?.length > 0 ? (
          <div className="flex gap-2 mt-1">
            {project.tags.map((tag, i) => (
              <span key={i} className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tags</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Created By:</h2>
        <p>{project.createdBy?.name} ({project.createdBy?.email})</p>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Members:</h2>
        {project.members?.length > 0 ? (
          <ul className="list-disc ml-6 mt-1 text-sm text-gray-700">
            {project.members.map((member) => (
              <li key={member._id}>
                {member.name} ({member.email})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No members added</p>
        )}
      </div>
    </div>
  );
}
