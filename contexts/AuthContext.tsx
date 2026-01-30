'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  userRole: 'admin' | 'participant' | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'participant' | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up new user
  async function signup(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name,
      role: 'participant', // Default role
      createdAt: new Date().toISOString(),
      avatar: null,
    });
  }

  // Login existing user
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  // Logout user
  async function logout() {
    await signOut(auth);
  }

  // Send password reset email
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Fetch user role from Firestore
  async function fetchUserRole(uid: string, email: string | null) {
    try {
      // Hardcoded admin emails (override database role)
      const ADMIN_EMAILS = ['manuela.i.caicedo@gmail.com'];

      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        setUserRole('admin');

        // Also update the database to reflect admin role
        try {
          await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
        } catch (error) {
          console.error('Error updating admin role in database:', error);
        }
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || 'participant');
      } else {
        setUserRole('participant');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('participant');
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    // Set a timeout to stop loading after 3 seconds even if auth doesn't respond
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setUser(user);
      if (user) {
        await fetchUserRole(user.uid, user.email);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    userRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
