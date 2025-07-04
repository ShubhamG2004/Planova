import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FiLoader, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import { format } from 'date-fns';

export default function InvitesPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvites = async () => {
    try {
      const res = await api.get('/invites');
      setInvites(res.data);
    } catch (err) {
      console.error('Error fetching invites:', err);
      setError('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInvites();
  }, [user]);

  const handleResponse = async (inviteId, action) => {
    try {
      await api.post(`/invites/${inviteId}/respond`, { action });
      fetchInvites(); // Refresh after response
    } catch (err) {
      console.error(`Failed to ${action} invite:`, err);
      alert(`Failed to ${action} invite`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading invites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <FiAlertCircle className="text-2xl mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Project Invitations</h1>

      {invites.length === 0 ? (
        <p className="text-gray-500">No invitations received yet.</p>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => (
            <div
              key={invite._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="text-gray-800 font-medium">
                  <FiUserPlus className="inline-block mr-1 text-green-600" />
                  <span className="text-indigo-600">{invite.sender?.name}</span> invited you to join <span className="text-indigo-700 font-semibold">{invite.project?.title}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Sent on {format(new Date(invite.createdAt), 'MMM d, yyyy')} • Status: <span className={`font-medium ${invite.status === 'pending' ? 'text-yellow-600' : invite.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>{invite.status}</span>
                </p>
              </div>

              {invite.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(invite._id, 'accept')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(invite._id, 'reject')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
