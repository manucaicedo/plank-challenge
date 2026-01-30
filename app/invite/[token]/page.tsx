'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';

interface Invitation {
  id: string;
  challengeId: string;
  email: string;
  token: string;
  status: string;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = params?.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  async function fetchInvitation() {
    try {
      const invitationsRef = collection(db, 'invitations');
      const q = query(invitationsRef, where('token', '==', token));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const inviteDoc = snapshot.docs[0];
        const inviteData = {
          id: inviteDoc.id,
          ...inviteDoc.data(),
        } as Invitation;

        setInvitation(inviteData);

        // Fetch challenge details
        const challengeDoc = await getDoc(doc(db, 'challenges', inviteData.challengeId));
        if (challengeDoc.exists()) {
          setChallenge({
            id: challengeDoc.id,
            ...challengeDoc.data(),
          } as Challenge);
        }
      } else {
        setError('Invitation not found or expired');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvitation() {
    if (!user || !invitation || !challenge) return;

    try {
      setAccepting(true);
      setError('');

      // Add user to participants collection
      await addDoc(collection(db, 'participants'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        challengeId: invitation.challengeId,
        status: 'active',
        joinedAt: new Date().toISOString(),
      });

      // Update invitation status
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedBy: user.uid,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error || 'This invitation link is not valid or has expired.'}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h1>
          <p className="text-gray-600 mb-6">You've already accepted this invitation!</p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 Plank Challenge</h1>
          <p className="text-gray-600">You've been invited to join a challenge!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{challenge.title}</h2>
          <p className="text-gray-700 mb-6">{challenge.description}</p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Challenge Details</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>📅 <strong>Duration:</strong> {challenge.startDate} to {challenge.endDate}</p>
              <p>⏱️ <strong>Goal:</strong> Record one daily plank for the entire month</p>
              <p>🏆 <strong>Compete:</strong> Track your progress and see how you rank</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!user ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-4">You need an account to join this challenge</p>
              <Link
                href={`/signup?invite=${token}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Sign Up to Join
              </Link>
              <Link
                href={`/login?invite=${token}`}
                className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Already have an account? Log In
              </Link>
            </div>
          ) : (
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? 'Joining Challenge...' : 'Accept Invitation & Join Challenge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
