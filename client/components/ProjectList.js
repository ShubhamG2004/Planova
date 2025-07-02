import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div 
          key={project._id} 
          className="p-4 border rounded-lg hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/projects/${project._id}`)}
        >
          <h3 className="font-bold">{project.title}</h3>
          <p className="text-gray-600">{project.description}</p>
          <div className="flex items-center mt-2">
            {project.members.slice(0, 3).map(member => (
              <div key={member.user._id} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                {member.user.name.charAt(0)}
              </div>
            ))}
            {project.members.length > 3 && (
              <div className="text-sm text-gray-500">
                +{project.members.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}