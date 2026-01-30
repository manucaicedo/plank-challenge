'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoute from '@/components/AdminRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

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
                    const today = new Date().toISOString().split('T')[0];
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
                          <Link
                            href={`/admin/challenges/${challenge.id}`}
                            className="ml-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View Details →
                          </Link>
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
