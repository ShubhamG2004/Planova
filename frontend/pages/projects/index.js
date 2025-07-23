import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { deleteDoc, doc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('members', 'array-contains', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => {
          const projectData = doc.data();
          return {
            id: doc.id,
            ...projectData,
            createdAt: projectData.createdAt?.toDate?.() || null,
          };
        });

        setProjects(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete project');
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Your Projects | ProjectFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
              <p className="mt-1 text-sm text-gray-500">
                {projects.length} active project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/projects/create"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + New Project
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
              <div className="mt-6">
                <Link
                  href="/projects/create"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  + New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Created by: {project.createdByName || 'You'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {project.createdAt && (
                          <time dateTime={project.createdAt.toISOString()}>
                            {format(project.createdAt, 'MMM d, yyyy')}
                          </time>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        {project.createdBy === user.uid && (
                          <>
                            <Link
                              href={`/projects/edit/${project.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
