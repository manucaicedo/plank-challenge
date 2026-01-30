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
    console.log('AuthContext: Starting signup for:', email);

    // Check if Firebase is initialized
    if (!auth || typeof auth.createUser === 'undefined') {
      console.error('AuthContext: Firebase auth not properly initialized');
      throw new Error('Authentication service not available');
    }

    console.log('AuthContext: Creating user with Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('AuthContext: User created in Firebase Auth:', user.uid);

    // Update display name
    console.log('AuthContext: Updating display name...');
    await updateProfile(user, { displayName: name });
    console.log('AuthContext: Display name updated');

    // Create user document in Firestore with timeout
    // If this fails, we'll create it later when they log in
    console.log('AuthContext: Creating Firestore user document...');
    try {
      await Promise.race([
        setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          role: 'participant', // Default role
          createdAt: new Date().toISOString(),
          avatar: null,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore write timeout after 5 seconds')), 5000)
        )
      ]);
      console.log('AuthContext: Firestore user document created');
    } catch (firestoreError) {
      console.warn('AuthContext: Failed to create Firestore document during signup:', firestoreError);
      console.log('AuthContext: Will create document on next login');
      // Don't fail the signup - we can create the document later
    }
    console.log('AuthContext: Signup complete!');
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
    console.log('AuthContext: fetchUserRole called for:', email);

    try {
      // Hardcoded admin emails (override database role)
      const ADMIN_EMAILS = ['manuela.i.caicedo@gmail.com'];

      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        console.log('AuthContext: User is admin by email, setting role immediately');
        setUserRole('admin');
        console.log('AuthContext: Admin role set, returning early');
        return;
      }

      console.log('AuthContext: Not admin, fetching user role from Firestore...');
      const userDoc = await Promise.race([
        getDoc(doc(db, 'users', uid)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore read timeout after 3 seconds')), 3000)
        )
      ]);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('AuthContext: User role from Firestore:', userData.role);
        setUserRole(userData.role || 'participant');
      } else {
        console.log('AuthContext: User document not found in Firestore, setting default role');
        setUserRole('participant');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      console.log('AuthContext: Setting default participant role due to error');
      setUserRole('participant');
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Set a timeout to stop loading after 2 seconds even if auth doesn't respond
    const timeout = setTimeout(() => {
      console.log('Auth timeout - stopping loading state');
      setLoading(false);
    }, 2000);

    // Check if auth is properly initialized
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      console.warn('Firebase auth not initialized');
      clearTimeout(timeout);
      setLoading(false);
      return;
    }

    try {
      console.log('AuthContext: Setting up auth state listener');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('AuthContext: Auth state changed, user:', user ? user.email : 'null');
        clearTimeout(timeout);
        setUser(user);
        if (user) {
          console.log('AuthContext: Fetching role for user:', user.uid);
          await fetchUserRole(user.uid, user.email);
        } else {
          setUserRole(null);
        }
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      });

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      clearTimeout(timeout);
      setLoading(false);
    }
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
