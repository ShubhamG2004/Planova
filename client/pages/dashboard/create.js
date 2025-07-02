// /client/pages/dashboard/create.js
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/router';

export default function CreateProject() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', members: [] });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch {
        alert('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      alert('Project created!');
      router.push('/dashboard');
    } catch {
      alert('Failed to create project');
    }
  };

  const handleMemberChange = (e) => {
    const id = e.target.value;
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter(m => m !== id)
        : [...prev.members, id]
    }));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Project Title"
          className="input"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="input"
          rows="3"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <label className="block font-semibold">Assign Members:</label>
        <div className="grid grid-cols-2 gap-2">
          {users.map(user => (
            <label key={user._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={user._id}
                onChange={handleMemberChange}
                checked={form.members.includes(user._id)}
              />
              {user.name} ({user.email})
            </label>
          ))}
        </div>
        <button className="btn bg-green-600 text-white">Create Project</button>
      </form>
    </div>
  );
}
