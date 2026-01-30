'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PlankTimer from '@/components/PlankTimer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function RecordPlankPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [alreadyRecorded, setAlreadyRecorded] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserChallenges();
    }
  }, [user, authLoading, router]);

  async function fetchUserChallenges() {
    try {
      // Check if db is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('Firestore not initialized');
        setError('Database not initialized. Please refresh the page.');
        setLoading(false);
        return;
      }

      // Get challenges where user is a participant
      const participantsRef = collection(db, 'participants');
      const q = query(
        participantsRef,
        where('userId', '==', user?.uid),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);

      const challengeIds = snapshot.docs.map((doc) => doc.data().challengeId);

      if (challengeIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch challenge details
      const challengesRef = collection(db, 'challenges');
      const challengePromises = challengeIds.map(async (id) => {
        const challengeQuery = query(challengesRef, where('__name__', '==', id));
        const challengeSnapshot = await getDocs(challengeQuery);
        if (!challengeSnapshot.empty) {
          return {
            id: challengeSnapshot.docs[0].id,
            ...challengeSnapshot.docs[0].data(),
          } as Challenge;
        }
        return null;
      });

      const challengeData = (await Promise.all(challengePromises)).filter(
        (c) => c !== null
      ) as Challenge[];

      // Filter for active challenges (today is between start and end date)
      const today = new Date().toISOString().split('T')[0];
      const activeChallenges = challengeData.filter(
        (c) => c.startDate <= today && c.endDate >= today
      );

      setChallenges(activeChallenges);
      if (activeChallenges.length === 1) {
        setSelectedChallenge(activeChallenges[0].id);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }

  async function checkAlreadyRecorded(challengeId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const planksRef = collection(db, 'planks');
      const q = query(
        planksRef,
        where('userId', '==', user?.uid),
        where('challengeId', '==', challengeId),
        where('date', '==', today)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking plank:', error);
      return false;
    }
  }

  async function handleStartTimer() {
    if (!selectedChallenge) {
      return setError('Please select a challenge');
    }

    // Check if already recorded today
    const recorded = await checkAlreadyRecorded(selectedChallenge);
    if (recorded) {
      setAlreadyRecorded(true);
      return;
    }

    setShowTimer(true);
  }

  async function handleTimerComplete(duration: number) {
    if (duration < 10) {
      setError('Plank must be at least 10 seconds');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const today = new Date().toISOString().split('T')[0];

      await addDoc(collection(db, 'planks'), {
        userId: user?.uid,
        challengeId: selectedChallenge,
        date: today,
        duration: duration,
        notes: null,
        createdAt: new Date().toISOString(),
      });

      setRecordedDuration(duration);
      setCompleted(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving plank:', error);
      setError(error.message || 'Failed to save plank');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-4xl font-bold text-green-600 mb-4">Plank Recorded!</h1>
              <p className="text-2xl text-gray-700 mb-2">
                Duration: <span className="font-bold">{Math.floor(recordedDuration / 60)}:{(recordedDuration % 60).toString().padStart(2, '0')}</span>
              </p>
              <p className="text-gray-600 mb-8">Great job! Keep up the streak! 💪</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (alreadyRecorded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Already Recorded Today</h1>
              <p className="text-gray-600 mb-8">
                You've already recorded your plank for today. Come back tomorrow!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="text-6xl mb-6">📋</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Challenges</h1>
              <p className="text-gray-600 mb-8">
                You're not currently participating in any active challenges.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
            Record Your Daily Plank
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            {!showTimer ? (
              <div className="text-center">
                {challenges.length > 1 && (
                  <div className="mb-8">
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Select Challenge
                    </label>
                    <select
                      value={selectedChallenge}
                      onChange={(e) => setSelectedChallenge(e.target.value)}
                      className="w-full max-w-md mx-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">-- Select a challenge --</option>
                      {challenges.map((challenge) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-8">
                  <div className="text-6xl mb-4">⏱️</div>
                  <p className="text-gray-600 mb-6">
                    Ready to plank? Click start when you're in position.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    You'll hear a 3-2-1 countdown before the timer starts.
                  </p>
                </div>

                <button
                  onClick={handleStartTimer}
                  disabled={!selectedChallenge}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Timer
                </button>
              </div>
            ) : (
              <div className="py-12">
                {saving ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Saving your plank...</p>
                  </div>
                ) : (
                  <PlankTimer onComplete={handleTimerComplete} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
