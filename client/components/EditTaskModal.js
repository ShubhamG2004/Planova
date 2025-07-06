import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiEdit2, FiX } from 'react-icons/fi';
import api from '@/lib/api';

export default function EditTaskModal({ isOpen, onClose, task, projectId, onUpdated }) {
  const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'todo',
        startDate: '',
        dueDate: '',
        assignedTo: '',
        priority: '',
        tags: [],
    });


  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (task) {
        setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        startDate: task.startDate?.slice(0, 10) || '',
        dueDate: task.dueDate?.slice(0, 10) || '',
        assignedTo: task.assignedTo?.id || '',
        priority: task.priority || '',
        tags: task.tags || [],
        });
    }
    }, [task]);


  useEffect(() => {
    if (projectId) {
      api.get(`/projects/${projectId}/members`)
        .then(res => setMembers(res.data))
        .catch(err => console.error('Failed to fetch members:', err));
    }
  }, [projectId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.put(`/tasks/task/${task._id}`, form);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30 px-4">
        <Dialog.Panel className="bg-white max-w-lg w-full p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Task</h2>
            <button onClick={onClose}><FiX className="text-xl" /></button>
          </div>

          <div className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border px-3 py-2 rounded"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
