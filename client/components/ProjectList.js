import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { cancelToken, cancel } = api.createCancelToken();

    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects', { cancelToken });
        setProjects(response.data);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.message);
          console.error('Project fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    return () => cancel('Component unmounted');
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}