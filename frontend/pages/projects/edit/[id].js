import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      const ref = doc(db, 'projects', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.createdBy !== user.uid) {
          alert("You don't have permission to edit this project.");
          router.push('/projects');
        } else {
          setTitle(data.title);
          setDescription(data.description);
        }
      }
    };
    fetchProject();
  }, [id, user, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'projects', id), {
        title,
        description
      });
      router.push('/projects');
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            className="border p-2 rounded"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project Description"
            className="border p-2 rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
            Update Project
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
