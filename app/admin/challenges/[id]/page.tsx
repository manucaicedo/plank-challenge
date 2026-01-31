'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminRoute from '@/components/AdminRoute';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

  useEffect(() => {
    fetchChallenge();
    fetchParticipants();
  }, [challengeId]);

  async function fetchChallenge() {
    try {
      // Check if db is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('Firestore not initialized');
        setLoading(false);
        return;
      }

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
      // Check if db is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('Firestore not initialized');
        return;
      }

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

        <main className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <button
                onClick={() => router.push('/admin')}
                className="text-sm md:text-base text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{challenge.title}</h1>
              <p className="text-sm md:text-base text-gray-600 mt-2">{challenge.description}</p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 text-xs md:text-sm text-gray-500">
                <span>📅 {challenge.startDate} to {challenge.endDate}</span>
                <span className="hidden sm:inline">•</span>
                <span>👥 {participants.length} participants</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 md:mb-8 bg-blue-50 rounded-lg p-4 md:p-6">
              <p className="text-sm md:text-base text-blue-900">
                Users can join this challenge from the <strong>Browse Challenges</strong> page. No invitations needed!
              </p>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Participants ({participants.length})</h2>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No participants yet</p>
                  <p className="text-xs mt-1">Users can join from the Browse Challenges page!</p>
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
