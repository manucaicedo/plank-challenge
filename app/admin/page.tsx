'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoute from '@/components/AdminRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { getLocalDateString } from '@/lib/utils/dateUtils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  adminId: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  async function fetchChallenges() {
    try {
      // Check if db is initialized
      if (!db || Object.keys(db).length === 0) {
        console.error('Firestore not initialized');
        setLoading(false);
        return;
      }

      const challengesRef = collection(db, 'challenges');
      const q = query(challengesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const challengeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Challenge[];

      setChallenges(challengeData);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChallenge(challengeId: string, challengeTitle: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${challengeTitle}"?\n\nThis will also delete:\n- All participant records\n- All plank records\n- All associated data\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      // Delete the challenge document
      await deleteDoc(doc(db, 'challenges', challengeId));

      // Delete related participants
      const participantsRef = collection(db, 'participants');
      const participantsQuery = query(participantsRef, where('challengeId', '==', challengeId));
      const participantsSnapshot = await getDocs(participantsQuery);

      const deletePromises = participantsSnapshot.docs.map((doc) => deleteDoc(doc.ref));

      // Delete related planks
      const planksRef = collection(db, 'planks');
      const planksQuery = query(planksRef, where('challengeId', '==', challengeId));
      const planksSnapshot = await getDocs(planksQuery);

      deletePromises.push(...planksSnapshot.docs.map((doc) => deleteDoc(doc.ref)));

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Update local state
      setChallenges(challenges.filter((c) => c.id !== challengeId));

      alert('Challenge deleted successfully!');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge. Please try again.');
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage challenges and participants</p>
              </div>
              <Link
                href="/admin/create-challenge"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                + Create Challenge
              </Link>
            </div>

            {/* Challenges List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Challenges</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading challenges...</p>
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first challenge</p>
                  <Link
                    href="/admin/create-challenge"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Create Challenge
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges.map((challenge) => {
                    const today = getLocalDateString();
                    const isActive = challenge.startDate <= today && challenge.endDate >= today;
                    const isUpcoming = challenge.startDate > today;
                    const isCompleted = challenge.endDate < today;

                    return (
                      <div
                        key={challenge.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {challenge.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? 'bg-green-100 text-green-700'
                                    : isUpcoming
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {isActive ? '🟢 Active' : isUpcoming ? '🟡 Upcoming' : '⚪ Completed'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📅 {challenge.startDate} to {challenge.endDate}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col space-y-2">
                            <Link
                              href={`/admin/challenges/${challenge.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                            >
                              View Details →
                            </Link>
                            <button
                              onClick={() => handleDeleteChallenge(challenge.id, challenge.title)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm whitespace-nowrap text-left"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
