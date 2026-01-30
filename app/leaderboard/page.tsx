'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { calculatePlankStats, formatDuration, calculateImprovement } from '@/lib/utils/plankStats';

interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface Participant {
  userId: string;
  userName: string;
  userEmail: string;
}

interface LeaderboardEntry extends Participant {
  daysCompleted: number;
  totalTime: number;
  averageTime: number;
  longestPlank: number;
  currentStreak: number;
  improvementRate: number;
  fistbumpCount: number;
  rank: number;
}

type SortBy = 'totalTime' | 'longestPlank' | 'daysCompleted' | 'currentStreak' | 'averageTime' | 'improvementRate';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('totalTime');
  const [loading, setLoading] = useState(true);
  const [givingFistbump, setGivingFistbump] = useState<string | null>(null);
  const [fistbumpMessage, setFistbumpMessage] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserChallenges();
    }
  }, [user, authLoading, router]);

  async function fetchUserChallenges() {
    try {
      // Fetch user's challenges
      const participantsRef = collection(db, 'participants');
      const participantsQuery = query(
        participantsRef,
        where('userId', '==', user?.uid),
        where('status', '==', 'active')
      );
      const participantsSnapshot = await getDocs(participantsQuery);
      const challengeIds = participantsSnapshot.docs.map((doc) => doc.data().challengeId);

      if (challengeIds.length === 0) {
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

      setChallenges(challengeData);

      // Select first challenge by default
      if (challengeData.length > 0) {
        setSelectedChallengeId(challengeData[0].id);
        await fetchLeaderboard(challengeData[0]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeaderboard(challenge: Challenge) {
    try {
      // Fetch all participants in this challenge
      const participantsRef = collection(db, 'participants');
      const participantsQuery = query(
        participantsRef,
        where('challengeId', '==', challenge.id),
        where('status', '==', 'active')
      );
      const participantsSnapshot = await getDocs(participantsQuery);

      const participants: Participant[] = participantsSnapshot.docs.map((doc) => ({
        userId: doc.data().userId,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
      }));

      // Fetch planks for all participants
      const leaderboardPromises = participants.map(async (participant) => {
        const planksRef = collection(db, 'planks');
        const planksQuery = query(
          planksRef,
          where('userId', '==', participant.userId),
          where('challengeId', '==', challenge.id)
        );
        const planksSnapshot = await getDocs(planksQuery);

        const planks = planksSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          duration: doc.data().duration,
        }));

        const stats = calculatePlankStats(planks, challenge.startDate, challenge.endDate);
        const improvement = calculateImprovement(planks);

        // Fetch fistbump count for this participant
        const fistbumpsRef = collection(db, 'fistbumps');
        const fistbumpsQuery = query(
          fistbumpsRef,
          where('toUserId', '==', participant.userId),
          where('challengeId', '==', challenge.id)
        );
        const fistbumpsSnapshot = await getDocs(fistbumpsQuery);
        const fistbumpCount = fistbumpsSnapshot.size;

        return {
          ...participant,
          daysCompleted: stats.daysCompleted,
          totalTime: stats.totalTime,
          averageTime: stats.averageTime,
          longestPlank: stats.longestPlank,
          currentStreak: stats.currentStreak,
          improvementRate: improvement,
          fistbumpCount: fistbumpCount,
          rank: 0, // Will be calculated after sorting
        };
      });

      const leaderboardData = await Promise.all(leaderboardPromises);
      sortLeaderboard(leaderboardData, sortBy);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }

  function sortLeaderboard(data: LeaderboardEntry[], sortField: SortBy) {
    const sorted = [...data].sort((a, b) => {
      // Sort in descending order (highest first)
      return b[sortField] - a[sortField];
    });

    // Assign ranks
    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(sorted);
  }

  async function handleChallengeChange(challengeId: string) {
    setSelectedChallengeId(challengeId);
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge) {
      await fetchLeaderboard(challenge);
    }
  }

  function handleSortChange(newSortBy: SortBy) {
    setSortBy(newSortBy);
    sortLeaderboard(leaderboard, newSortBy);
  }

  async function giveFistbump(toUserId: string, toUserName: string) {
    if (!user || !selectedChallengeId) return;

    // Can't fistbump yourself
    if (toUserId === user.uid) {
      setFistbumpMessage("You can't fistbump yourself! 😅");
      setTimeout(() => setFistbumpMessage(''), 3000);
      return;
    }

    try {
      setGivingFistbump(toUserId);
      const today = new Date().toISOString().split('T')[0];

      // Check if already gave fistbump today
      const fistbumpsRef = collection(db, 'fistbumps');
      const existingQuery = query(
        fistbumpsRef,
        where('fromUserId', '==', user.uid),
        where('toUserId', '==', toUserId),
        where('challengeId', '==', selectedChallengeId),
        where('date', '==', today)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        setFistbumpMessage(`You already fistbumped ${toUserName} today! 👊`);
        setTimeout(() => setFistbumpMessage(''), 3000);
        return;
      }

      // Give fistbump
      await addDoc(fistbumpsRef, {
        fromUserId: user.uid,
        toUserId: toUserId,
        challengeId: selectedChallengeId,
        date: today,
        createdAt: new Date().toISOString(),
      });

      setFistbumpMessage(`👊 Fistbump sent to ${toUserName}!`);
      setTimeout(() => setFistbumpMessage(''), 3000);

      // Refresh leaderboard to update counts
      const challenge = challenges.find((c) => c.id === selectedChallengeId);
      if (challenge) {
        await fetchLeaderboard(challenge);
      }
    } catch (error) {
      console.error('Error giving fistbump:', error);
      setFistbumpMessage('Failed to send fistbump. Try again.');
      setTimeout(() => setFistbumpMessage(''), 3000);
    } finally {
      setGivingFistbump(null);
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

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other participants</p>
          </div>

          {challenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Challenges</h2>
              <p className="text-gray-600 mb-6">
                You're not currently participating in any challenges.
              </p>
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

              {/* Sort Options */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSortChange('totalTime')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'totalTime'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Total Time
                  </button>
                  <button
                    onClick={() => handleSortChange('longestPlank')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'longestPlank'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Longest Plank
                  </button>
                  <button
                    onClick={() => handleSortChange('daysCompleted')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'daysCompleted'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Days Completed
                  </button>
                  <button
                    onClick={() => handleSortChange('currentStreak')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'currentStreak'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Current Streak
                  </button>
                  <button
                    onClick={() => handleSortChange('averageTime')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'averageTime'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Average Time
                  </button>
                  <button
                    onClick={() => handleSortChange('improvementRate')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      sortBy === 'improvementRate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📈 Most Improved
                  </button>
                </div>
              </div>

              {/* Fistbump Message */}
              {fistbumpMessage && (
                <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg">
                  {fistbumpMessage}
                </div>
              )}

              {/* Leaderboard */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {leaderboard.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p>No participants yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.userId === user?.uid;
                      const isPodium = index < 3;

                      return (
                        <div
                          key={entry.userId}
                          className={`p-6 transition ${
                            isCurrentUser
                              ? 'bg-blue-50 border-l-4 border-blue-600'
                              : isPodium
                              ? 'bg-yellow-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Rank */}
                              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                {isPodium ? (
                                  <span className="text-3xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                  </span>
                                ) : (
                                  <span className="text-xl font-bold text-gray-400">
                                    #{entry.rank}
                                  </span>
                                )}
                              </div>

                              {/* User Info */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-gray-900 text-lg">
                                    {entry.userName}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                      You
                                    </span>
                                  )}
                                  {entry.fistbumpCount > 0 && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded flex items-center space-x-1">
                                      <span>👊</span>
                                      <span>{entry.fistbumpCount}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{entry.userEmail}</p>
                              </div>

                              {/* Stats */}
                              <div className="hidden md:flex space-x-6 text-sm">
                                <div className="text-center">
                                  <p className="text-gray-500">Total</p>
                                  <p className="font-bold text-gray-900">
                                    {formatDuration(entry.totalTime)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Longest</p>
                                  <p className="font-bold text-gray-900">
                                    {formatDuration(entry.longestPlank)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Days</p>
                                  <p className="font-bold text-gray-900">{entry.daysCompleted}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Streak</p>
                                  <p className="font-bold text-gray-900">{entry.currentStreak}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Improved</p>
                                  <p className={`font-bold ${entry.improvementRate > 0 ? 'text-green-600' : entry.improvementRate < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {entry.improvementRate > 0 ? '+' : ''}{entry.improvementRate}%
                                  </p>
                                </div>
                              </div>

                              {/* Fistbump Button */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => giveFistbump(entry.userId, entry.userName)}
                                  disabled={givingFistbump === entry.userId}
                                  className="flex-shrink-0 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition"
                                >
                                  {givingFistbump === entry.userId ? '...' : '👊 Fistbump'}
                                </button>
                              )}
                            </div>

                            {/* Current Sort Value (mobile) */}
                            <div className="md:hidden text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {sortBy === 'totalTime' || sortBy === 'longestPlank' || sortBy === 'averageTime'
                                  ? formatDuration(entry[sortBy])
                                  : sortBy === 'improvementRate'
                                  ? `${entry.improvementRate > 0 ? '+' : ''}${entry[sortBy]}%`
                                  : entry[sortBy]}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
