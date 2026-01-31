'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, addDoc, where } from 'firebase/firestore';

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rules?: string;
  status: 'active' | 'upcoming' | 'completed';
  adminId: string;
  createdAt: string;
}

interface Participant {
  id: string;
  userId: string;
  challengeId: string;
}

type FilterType = 'all' | 'active' | 'upcoming';

export default function BrowseChallengesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch all challenges
      const challengesRef = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesRef);
      const challengeData = challengesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Challenge[];

      // Sort by start date (newest first)
      challengeData.sort((a, b) => b.startDate.localeCompare(a.startDate));
      setChallenges(challengeData);

      // Fetch user's participations
      if (user) {
        const participantsRef = collection(db, 'participants');
        const participantsQuery = query(
          participantsRef,
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        const participantsSnapshot = await getDocs(participantsQuery);
        const participantData = participantsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Participant[];
        setParticipants(participantData);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setErrorMessage('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinChallenge(challengeId: string) {
    if (!user) return;

    // Check if already joined
    const alreadyJoined = participants.some((p) => p.challengeId === challengeId);
    if (alreadyJoined) {
      setErrorMessage('You have already joined this challenge');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setJoiningId(challengeId);
      setErrorMessage('');
      setSuccessMessage('');

      // Add user to participants collection
      await addDoc(collection(db, 'participants'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        challengeId,
        status: 'active',
        joinedAt: new Date().toISOString(),
      });

      // Refresh participants
      await fetchData();

      setSuccessMessage('Successfully joined challenge!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error joining challenge:', error);
      setErrorMessage('Failed to join challenge');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setJoiningId(null);
    }
  }

  function isUserJoined(challengeId: string): boolean {
    return participants.some((p) => p.challengeId === challengeId);
  }

  function getFilteredChallenges(): Challenge[] {
    if (filter === 'all') return challenges;
    return challenges.filter((c) => c.status === filter);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredChallenges = getFilteredChallenges();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Challenges</h1>
            <p className="text-gray-600">Discover and join plank challenges</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
          </div>

          {/* Challenges List */}
          {filteredChallenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Challenges Found</h2>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'No challenges available yet'
                  : `No ${filter} challenges at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredChallenges.map((challenge) => {
                const joined = isUserJoined(challenge.id);
                const isJoining = joiningId === challenge.id;

                return (
                  <div
                    key={challenge.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : challenge.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </span>
                      {joined && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Joined
                        </span>
                      )}
                    </div>

                    {/* Challenge Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 mb-4">{challenge.description}</p>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <p>📅 {challenge.startDate} to {challenge.endDate}</p>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={joined || isJoining}
                      className={`w-full font-semibold py-3 rounded-lg transition ${
                        joined
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isJoining ? 'Joining...' : joined ? 'Already Joined' : 'Join Challenge'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
