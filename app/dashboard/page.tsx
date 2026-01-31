'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PlankCalendar from '@/components/PlankCalendar';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { calculatePlankStats, formatDuration, PlankStats } from '@/lib/utils/plankStats';

interface Plank {
  id: string;
  date: string;
  duration: number;
  challengeId: string;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [planks, setPlanks] = useState<Plank[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<PlankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      // Set a timeout to stop loading after 5 seconds
      const timeout = setTimeout(() => {
        console.warn('Dashboard loading timeout - stopping loading state');
        setLoading(false);
      }, 5000);

      fetchUserData().finally(() => {
        clearTimeout(timeout);
      });

      return () => clearTimeout(timeout);
    }
  }, [user, authLoading, router]);

  async function fetchUserData() {
    console.log('Dashboard: Starting fetchUserData');
    try {
      // Check if db is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('Dashboard: Firestore not initialized');
        setLoading(false);
        return;
      }

      console.log('Dashboard: Fetching participants for user:', user?.uid);
      // Fetch user's challenges - use simple query to avoid index issues
      const participantsRef = collection(db, 'participants');
      const participantsQuery = query(
        participantsRef,
        where('userId', '==', user?.uid)
      );

      console.log('Dashboard: Executing Firestore query...');
      const participantsSnapshot = await Promise.race([
        getDocs(participantsQuery),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore query timeout after 3 seconds')), 3000)
        )
      ]);

      // Filter by status in JavaScript to avoid compound index requirement
      const challengeIds = participantsSnapshot.docs
        .filter((doc) => doc.data().status === 'active')
        .map((doc) => doc.data().challengeId);

      console.log('Dashboard: Found challenge IDs:', challengeIds);
      console.log('Dashboard: Number of participants found:', participantsSnapshot.docs.length);

      if (challengeIds.length === 0) {
        console.log('Dashboard: No challenges found - user is not a participant in any active challenges');
        setLoading(false);
        return;
      }

      // Fetch challenge details
      const challengePromises = challengeIds.map(async (id) => {
        const challengeDoc = await getDoc(doc(db, 'challenges', id));
        if (challengeDoc.exists()) {
          return {
            id: challengeDoc.id,
            ...challengeDoc.data(),
          } as Challenge;
        }
        return null;
      });

      const challengeData = (await Promise.all(challengePromises)).filter(
        (c) => c !== null
      ) as Challenge[];

      console.log('Dashboard: Fetched challenges:', challengeData);
      setChallenges(challengeData);

      // Select first challenge by default
      if (challengeData.length > 0) {
        console.log('Dashboard: Fetching planks for first challenge');
        setSelectedChallengeId(challengeData[0].id);
        await fetchPlanksForChallenge(challengeData[0].id, challengeData[0]);
        console.log('Dashboard: Finished fetching planks');
      }
    } catch (error) {
      console.error('Dashboard: Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlanksForChallenge(challengeId: string, challenge: Challenge) {
    try {
      const planksRef = collection(db, 'planks');
      const planksQuery = query(
        planksRef,
        where('userId', '==', user?.uid),
        where('challengeId', '==', challengeId)
      );
      const planksSnapshot = await getDocs(planksQuery);

      const plankData = planksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Plank[];

      setPlanks(plankData);

      // Calculate stats
      const calculatedStats = calculatePlankStats(
        plankData.map((p) => ({ date: p.date, duration: p.duration })),
        challenge.startDate,
        challenge.endDate
      );
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching planks:', error);
    }
  }

  async function handleChallengeChange(challengeId: string) {
    setSelectedChallengeId(challengeId);
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge) {
      await fetchPlanksForChallenge(challengeId, challenge);
    }
  }

  if (authLoading || loading) {
    console.log('Dashboard: Still loading - authLoading:', authLoading, 'loading:', loading);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-xs text-gray-400">
            (Auth: {authLoading ? 'loading' : 'ready'}, Data: {loading ? 'loading' : 'ready'})
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user.displayName || 'Participant'}! 💪
            </h1>
            <p className="text-gray-600">Track your progress and keep up the streak!</p>
          </div>

          {challenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Challenges</h2>
              <p className="text-gray-600 mb-6">
                You're not currently participating in any challenges.
              </p>
              <Link
                href="/challenges"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Browse Available Challenges
              </Link>
            </div>
          ) : (
            <>
              {/* Challenge Selector */}
              {challenges.length > 1 && (
                <div className="mb-6">
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => handleChallengeChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {challenges.map((challenge) => (
                      <option key={challenge.id} value={challenge.id}>
                        {challenge.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Record Plank Button */}
              <div className="mb-8">
                <Link
                  href="/record-plank"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-xl transition shadow-lg hover:shadow-xl"
                >
                  ⏱️ Record Today's Plank
                </Link>
              </div>

              {stats && (
                <>
                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Days Completed</span>
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {stats.daysCompleted}/{stats.totalDays}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {stats.completionRate}% complete
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Current Streak</span>
                        <span className="text-2xl">🔥</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.currentStreak}</div>
                      <div className="mt-2 text-sm text-gray-500">
                        Longest: {stats.longestStreak} days
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Total Time</span>
                        <span className="text-2xl">⏱️</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatDuration(stats.totalTime)}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Avg: {formatDuration(stats.averageTime)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Longest Plank</span>
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatDuration(stats.longestPlank)}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Personal record</div>
                    </div>
                  </div>

                  {/* Calendar and Recent Planks */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    {selectedChallenge && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Progress Calendar
                        </h2>
                        <PlankCalendar
                          planks={planks.map((p) => ({ date: p.date, duration: p.duration }))}
                          startDate={selectedChallenge.startDate}
                          endDate={selectedChallenge.endDate}
                        />
                      </div>
                    )}

                    {/* Recent Planks */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Planks</h2>
                      {planks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No planks recorded yet</p>
                          <p className="text-xs mt-1">Start by recording your first plank!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {planks
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .slice(0, 10)
                            .map((plank) => {
                              const date = new Date(plank.date);
                              const formattedDate = date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              });

                              return (
                                <div
                                  key={plank.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">{formattedDate}</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedChallenge?.title}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">
                                      {formatDuration(plank.duration)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
