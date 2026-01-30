'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminRoute from '@/components/AdminRoute';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rules?: string;
  status: string;
  adminId: string;
  createdAt: string;
}

interface Participant {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  joinedAt: string;
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    fetchChallenge();
    fetchParticipants();
  }, [challengeId]);

  async function fetchChallenge() {
    try {
      const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
      if (challengeDoc.exists()) {
        setChallenge({
          id: challengeDoc.id,
          ...challengeDoc.data(),
        } as Challenge);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchParticipants() {
    try {
      const participantsRef = collection(db, 'participants');
      const q = query(participantsRef, where('challengeId', '==', challengeId));
      const snapshot = await getDocs(q);

      const participantData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Participant[];

      setParticipants(participantData);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!inviteEmail) {
      return setInviteError('Please enter an email address');
    }

    try {
      setInviteError('');
      setInviteSuccess('');
      setInviteLoading(true);

      // Create invitation token
      const invitationToken = Math.random().toString(36).substring(2, 15);

      // Save invitation to Firestore
      await addDoc(collection(db, 'invitations'), {
        challengeId,
        email: inviteEmail,
        token: invitationToken,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // TODO: Send email with invitation link
      // For now, we'll just show success message
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');

      // Refresh participants after short delay
      setTimeout(fetchParticipants, 1000);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setInviteError(error.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading challenge...</p>
          </div>
        </div>
      </AdminRoute>
    );
  }

  if (!challenge) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Challenge not found</h2>
            <button
              onClick={() => router.push('/admin')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/admin')}
                className="text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
              <p className="text-gray-600 mt-2">{challenge.description}</p>
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span>📅 {challenge.startDate} to {challenge.endDate}</span>
                <span>•</span>
                <span>👥 {participants.length} participants</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Invite Participants */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Participants</h2>

                {inviteSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {inviteSuccess}
                  </div>
                )}

                {inviteError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {inviteError}
                  </div>
                )}

                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="participant@example.com"
                      disabled={inviteLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">📧 Email Invitations</p>
                  <p className="text-xs text-blue-700">
                    Note: Email service integration coming soon. For now, invitations are saved to the database.
                  </p>
                </div>
              </div>

              {/* Participants List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Participants ({participants.length})</h2>

                {participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No participants yet</p>
                    <p className="text-xs mt-1">Start by inviting people to join!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{participant.userName}</p>
                          <p className="text-sm text-gray-600">{participant.userEmail}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            participant.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {participant.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Challenge Details */}
            {challenge.rules && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Challenge Rules</h2>
                <div className="text-gray-700 whitespace-pre-line">{challenge.rules}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
